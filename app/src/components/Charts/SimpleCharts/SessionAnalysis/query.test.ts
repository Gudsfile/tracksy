import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { querySessionAnalysis } from './query'
import { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

describe('SessionAnalysis Query', () => {
    beforeAll(async () => {
        conn = await DuckDBConnection.create()
    })

    afterAll(() => {
        conn.closeSync()
    })

    beforeEach(async () => {
        await conn.run(`
            CREATE OR REPLACE TABLE stream_sessions (
                session_id BIGINT,
                track_count BIGINT,
                duration_ms BIGINT,
                session_start VARCHAR,
                session_end VARCHAR
            )
        `)
        await conn.run(`
            INSERT INTO stream_sessions VALUES
            (1, 5, 1800000, '2025-01-10T20:00:00', '2025-01-10T20:30:00'),
            (2, 8, 3600000, '2025-01-15T21:00:00', '2025-01-15T22:00:00'),
            (3, 3,  900000, '2024-06-01T10:00:00', '2024-06-01T10:15:00')
        `)
    })

    it('should return one aggregate row per year filter', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(2025))
        const rows = result.getRowObjectsJson()
        expect(rows).toHaveLength(1)
        expect(rows[0].session_count).toBe(2)
    })

    it('should include all sessions when year is undefined', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(undefined))
        const rows = result.getRowObjectsJson()
        expect(rows[0].session_count).toBe(3)
    })

    it('should compute avg_duration_ms correctly', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(2025))
        const rows = result.getRowObjectsJson()
        expect(rows[0].avg_duration_ms).toBe(2700000)
    })

    it('should identify the longest session', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(2025))
        const rows = result.getRowObjectsJson()
        expect(rows[0].longest_session_ms).toBe(3600000)
        expect(rows[0].longest_session_track_count).toBe(8)
    })

    it('should return the start time of the longest session as longest_session_date', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(2025))
        const rows = result.getRowObjectsJson()
        expect(rows[0].longest_session_date).toBe('2025-01-15T21:00:00')
    })

    it('should return the most frequent start hour as peak_start_hour', async () => {
        const result = await conn.runAndReadAll(querySessionAnalysis(undefined))
        const rows = result.getRowObjectsJson()
        // two sessions start at 20h and 21h, one at 10h — no single mode,
        // but the value must be a valid hour integer
        expect(rows[0].peak_start_hour).toBeGreaterThanOrEqual(0)
        expect(rows[0].peak_start_hour).toBeLessThanOrEqual(23)
    })

    it('should return peak_start_hour matching the unique start hour when unambiguous', async () => {
        await conn.run(`
            INSERT INTO stream_sessions VALUES
            (4, 2, 600000, '2025-02-01T20:00:00', '2025-02-01T20:10:00')
        `)
        const result = await conn.runAndReadAll(querySessionAnalysis(2025))
        const rows = result.getRowObjectsJson()
        // 2025 now has two 20h sessions (ids 1 and 4) vs one 21h — peak must be 20
        expect(rows[0].peak_start_hour).toBe(20)
    })
})
