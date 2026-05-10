import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { buildSessionAnalysisDetailedQuery } from './query'
import { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

describe('SessionAnalysis Detailed Query', () => {
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

    it('should filter to the specified year', async () => {
        const result = await conn.runAndReadAll(
            buildSessionAnalysisDetailedQuery(2025)
        )
        const rows = result.getRowObjectsJson()
        expect(rows).toHaveLength(2)
    })

    it('should return all sessions when year is undefined', async () => {
        const result = await conn.runAndReadAll(
            buildSessionAnalysisDetailedQuery(undefined)
        )
        const rows = result.getRowObjectsJson()
        expect(rows).toHaveLength(3)
    })

    it('should return correct session fields', async () => {
        const result = await conn.runAndReadAll(
            buildSessionAnalysisDetailedQuery(2025)
        )
        const rows = result.getRowObjectsJson()
        expect(rows[0]).toMatchObject({
            session_id: 1,
            track_count: 5,
            duration_ms: 1800000,
        })
    })

    it('should order results by session_start ascending', async () => {
        const result = await conn.runAndReadAll(
            buildSessionAnalysisDetailedQuery(2025)
        )
        const rows = result.getRowObjectsJson()
        const starts = rows.map((r) => r.session_start as string)
        expect(starts[0] < starts[1]).toBe(true)
    })

    it('should return day_of_week computed by DuckDB', async () => {
        const result = await conn.runAndReadAll(
            buildSessionAnalysisDetailedQuery(2025)
        )
        const rows = result.getRowObjectsJson()
        // 2025-01-10 is a Friday (5), 2025-01-15 is a Wednesday (3)
        expect(rows[0].day_of_week).toBe(5)
        expect(rows[1].day_of_week).toBe(3)
    })
})
