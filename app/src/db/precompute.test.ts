import { describe, it, expect, vi } from 'vitest'
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { precomputeDerivedTables } from './precompute'

function mockConn() {
    return {
        query: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection
}

describe('precomputeDerivedTables', () => {
    it('executes 11 queries (2 DROP + 1 CREATE TABLE music_streams + 4 DROP + 4 CREATE derived)', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)
        expect(conn.query).toHaveBeenCalledTimes(11)
    })

    it('materializes the timezone-adjusted music_streams table before derived tables', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[0]).toBe('DROP VIEW IF EXISTS music_streams')
        expect(calls[1]).toBe('DROP TABLE IF EXISTS music_streams')
        expect(calls[2]).toMatch(/^CREATE TABLE music_streams AS/)
    })

    it('drops all derived tables before creating them', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[3]).toBe('DROP TABLE IF EXISTS daily_stream_counts')
        expect(calls[5]).toBe('DROP TABLE IF EXISTS artist_first_year')
        expect(calls[7]).toBe('DROP TABLE IF EXISTS stream_sessions')
        expect(calls[9]).toBe('DROP TABLE IF EXISTS summarize_cache')
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
