import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest'
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { DuckDBConnection } from '@duckdb/node-api'
import { precomputeDerivedTables } from './precompute'
import { RAW_TABLE, TABLE } from './queries/constants'

function mockConn() {
    return {
        query: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection
}

describe('precomputeDerivedTables', () => {
    it('executes 9 queries (1 CREATE TABLE music_streams + 4 CREATE derived)', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)
        expect(conn.query).toHaveBeenCalledTimes(5)
    })

    it('materializes the timezone-adjusted music_streams table before derived tables', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[0]).toMatch(/^CREATE OR REPLACE TABLE music_streams AS/)
    })

    it('recreates daily_stream_counts, artist_first_year, stream_sessions, summarize_cache', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[1]).toMatch(
            /^CREATE OR REPLACE TABLE daily_stream_counts AS/
        )
        expect(calls[2]).toMatch(
            /^CREATE OR REPLACE TABLE artist_first_year AS/
        )
        expect(calls[3]).toMatch(/^CREATE OR REPLACE TABLE stream_sessions AS/)
        expect(calls[4]).toMatch(/^CREATE OR REPLACE TABLE summarize_cache AS/)
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

describe('precomputeDerivedTables ts conversion (real DuckDB)', () => {
    let duck: DuckDBConnection

    beforeAll(async () => {
        duck = await DuckDBConnection.create()
    })

    afterAll(() => {
        duck.closeSync()
    })

    async function localTs(rawTs: string[], tz: string): Promise<string[]> {
        await duck.run(`
            CREATE OR REPLACE TABLE ${RAW_TABLE} (
                track_uri VARCHAR,
                track_name VARCHAR,
                artist_name VARCHAR,
                album_name VARCHAR,
                ts VARCHAR,
                ms_played DOUBLE,
                platform VARCHAR
            )
        `)
        for (const ts of rawTs) {
            await duck.run(
                `INSERT INTO ${RAW_TABLE} VALUES ('uri', 'Track', 'Artist', 'Album', '${ts}', 180000, 'IPHONE')`
            )
        }
        const conn = {
            query: (sql: string) => duck.run(sql),
        } as unknown as AsyncDuckDBConnection
        await precomputeDerivedTables(conn, tz)

        const result = await duck.runAndReadAll(
            `SELECT strftime(ts, '%Y-%m-%d %H:%M:%S') AS ts FROM ${TABLE}`
        )
        return result.getRowObjectsJson().map((r) => String(r.ts))
    }

    it('keeps the wall-clock time of a positive-offset timestamp', async () => {
        const rows = await localTs(
            ['2024-01-15T12:00:00.000+02:00'],
            'America/New_York'
        )
        expect(rows).toEqual(['2024-01-15 12:00:00'])
    })

    it('keeps the wall-clock time of a negative-offset timestamp', async () => {
        const rows = await localTs(
            ['2024-01-15T12:00:00.000-02:00'],
            'America/New_York'
        )
        expect(rows).toEqual(['2024-01-15 12:00:00'])
    })

    it('keeps the local date of a non-whole-hour offset timestamp', async () => {
        const rows = await localTs(
            ['2024-01-16T05:00:00.000+05:30'],
            'America/New_York'
        )
        expect(rows).toEqual(['2024-01-16 05:00:00'])
    })

    it('converts a UTC (Z) timestamp to the given timezone', async () => {
        const rows = await localTs(
            ['2024-01-15T14:00:00.000Z'],
            'America/New_York'
        )
        expect(rows).toEqual(['2024-01-15 09:00:00'])
    })

    it('handles offset and UTC timestamps in the same table', async () => {
        const rows = await localTs(
            [
                '2024-01-15T12:00:00.000+02:00',
                '2024-01-15T12:00:00.000-02:00',
                '2024-01-15T14:00:00.000Z',
            ],
            'Europe/Paris'
        )
        expect(rows.sort()).toEqual([
            '2024-01-15 12:00:00',
            '2024-01-15 12:00:00',
            '2024-01-15 15:00:00',
        ])
    })
})
