import { describe, it, expect, vi } from 'vitest'
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { precomputeDerivedTables } from './precompute'

function mockConn() {
    return {
        query: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection
}

describe('precomputeDerivedTables', () => {
    it('executes at least 9 queries (1 CREATE VIEW + 4 DROP + 4 CREATE)', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)
        expect(conn.query).toHaveBeenCalledTimes(9)
    })

    it('creates the timezone view before derived tables', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[0]).toMatch(/CREATE OR REPLACE VIEW music_streams/)
    })

    it('drops all derived tables before creating them', async () => {
        const conn = mockConn()
        await precomputeDerivedTables(conn)

        const calls: string[] = (
            conn.query as ReturnType<typeof vi.fn>
        ).mock.calls.map((c: string[]) => c[0].trim())

        expect(calls[1]).toBe('DROP TABLE IF EXISTS daily_stream_counts')
        expect(calls[3]).toBe('DROP TABLE IF EXISTS artist_first_year')
        expect(calls[5]).toBe('DROP TABLE IF EXISTS stream_sessions')
        expect(calls[7]).toBe('DROP TABLE IF EXISTS summarize_cache')
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
})
