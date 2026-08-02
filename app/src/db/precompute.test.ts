import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest'
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { DuckDBConnection } from '@duckdb/node-api'
import { precomputeDerivedTables, tsConversionExpr } from './precompute'

function mockConn() {
    return {
        query: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection
}

describe('precomputeDerivedTables', () => {
    it('executes 12 queries (1 SET TimeZone + 2 DROP + 1 CREATE TABLE music_streams + 4 DROP + 4 CREATE derived)', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)
        expect(conn.query).toHaveBeenCalledTimes(12)
    })

    it('pins the session time zone to UTC before materializing music_streams', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[0]).toBe(`SET TimeZone='UTC'`)
    })

    it('materializes the timezone-adjusted music_streams table before derived tables', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[1]).toBe('DROP VIEW IF EXISTS music_streams')
        expect(calls[2]).toBe('DROP TABLE IF EXISTS music_streams')
        expect(calls[3]).toMatch(/^CREATE TABLE music_streams AS/)
    })

    it('drops all derived tables before creating them', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[4]).toBe('DROP TABLE IF EXISTS daily_stream_counts')
        expect(calls[6]).toBe('DROP TABLE IF EXISTS artist_first_year')
        expect(calls[8]).toBe('DROP TABLE IF EXISTS stream_sessions')
        expect(calls[10]).toBe('DROP TABLE IF EXISTS summarize_cache')
    })

    it('creates daily_stream_counts, artist_first_year, stream_sessions, summarize_cache', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0])

        expect(calls.some((q) => q.includes('daily_stream_counts'))).toBe(true)
        expect(calls.some((q) => q.includes('artist_first_year'))).toBe(true)
        expect(calls.some((q) => q.includes('stream_sessions'))).toBe(true)
        expect(calls.some((q) => q.includes('summarize_cache'))).toBe(true)
    })

    it('propagates errors from conn.query', async () => {
        const conn = {
            query: vi.fn().mockRejectedValueOnce(new Error('DuckDB error')),
        } as unknown as AsyncDuckDBConnection

        await expect(precomputeDerivedTables(conn)).rejects.toThrow(
            'DuckDB error'
        )
    })

    it('calls onProgress once per step (5 total: 1 main + 4 derived)', async () => {
        const conn = mockConn()
        const onProgress = vi.fn()
        await precomputeDerivedTables(conn, undefined, onProgress)
        expect(onProgress).toHaveBeenCalledTimes(5)
    })

    it('calls onProgress with increasing percentages ending at 100', async () => {
        const conn = mockConn()
        const percents: number[] = []
        await precomputeDerivedTables(conn, undefined, (_stage, pct) =>
            percents.push(pct)
        )
        expect(percents[percents.length - 1]).toBe(100)
        expect(percents).toEqual([...percents].sort((a, b) => a - b))
    })

    it('works without onProgress (optional)', async () => {
        const conn = mockConn()
        await expect(precomputeDerivedTables(conn)).resolves.toBeUndefined()
    })
})

// @duckdb/node-api pins an older DuckDB build than the one bundled in
// @duckdb/duckdb-wasm (the engine this app actually runs). Its cast from an
// offset-bearing string straight to TIMESTAMP happens to already resolve the
// offset, so it can't reproduce the pre-fix bug (verified against DuckDB CLI
// 1.5.x, whose behavior matches the wasm build: the offset was silently
// dropped instead). These tests still validate the new expression's documented
// TIMESTAMPTZ semantics and guard against a regression in this SQL text.
describe('tsConversionExpr (real DuckDB semantics)', () => {
    let conn: DuckDBConnection

    beforeAll(async () => {
        conn = await DuckDBConnection.create()
    })

    afterAll(() => {
        conn.closeSync()
    })

    async function convert(ts: string, tz: string): Promise<string> {
        const result = await conn.runAndReadAll(
            `SELECT (${tsConversionExpr(tz)})::VARCHAR AS ts FROM (SELECT '${ts}' AS ts) raw`
        )
        const [row] = result.getRowObjectsJson() as { ts: string }[]
        return row.ts
    }

    it('preserves the local hour of a non-UTC offset when the home timezone matches (Apple Music)', async () => {
        // A user in New York listens at 22:00 local time. Apple Music encodes
        // this as "...T22:00:00-05:00". With a New York home timezone, the
        // converted hour must still read 22:00 — not shift to a
        // UTC-normalized hour as it did when the raw string was first cast to
        // the offset-less TIMESTAMP type.
        const ts = await convert(
            '2024-01-15T22:00:00-05:00',
            'America/New_York'
        )
        expect(ts).toBe('2024-01-15 22:00:00')
    })

    it('converts a non-UTC offset into a different home timezone correctly', async () => {
        // Same instant (2024-01-16T03:00:00Z), but the user's home timezone is
        // Paris (UTC+01:00 in January): 03:00 UTC -> 04:00 Paris.
        const ts = await convert('2024-01-15T22:00:00-05:00', 'Europe/Paris')
        expect(ts).toBe('2024-01-16 04:00:00')
    })

    it('still converts UTC Z-suffixed timestamps correctly (Spotify/Deezer/JellyFin/Custom)', async () => {
        // 22:00 UTC -> 23:00 Paris, matching the pre-existing
        // `TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE tz` behavior for every
        // other provider, which always emits Z-suffixed UTC strings.
        const ts = await convert('2024-01-15T22:00:00Z', 'Europe/Paris')
        expect(ts).toBe('2024-01-15 23:00:00')
    })

    it('resolves a zone-less ts string against the ambient session time zone, not UTC', async () => {
        // Unlike the old expression (which pinned via a literal `AT TIME ZONE
        // 'UTC'`), casting straight to TIMESTAMPTZ resolves a string with no
        // offset/Z marker against whatever session TimeZone is currently set.
        // No built-in provider emits zone-less strings, but a hand-edited
        // Custom CSV could — this is exactly why precomputeDerivedTables pins
        // `SET TimeZone='UTC'` before running this expression.
        await conn.run(`SET TimeZone='Asia/Tokyo'`)
        const tokyoResult = await convert('2024-01-15 22:00:00', 'Europe/Paris')

        await conn.run(`SET TimeZone='UTC'`)
        const utcPinnedResult = await convert(
            '2024-01-15 22:00:00',
            'Europe/Paris'
        )

        expect(tokyoResult).not.toBe(utcPinnedResult)
        // With the pin in place (as precomputeDerivedTables applies it), the
        // zone-less string is anchored to UTC, matching the deterministic
        // behavior of the pre-fix expression.
        expect(utcPinnedResult).toBe('2024-01-15 23:00:00')
    })
})
