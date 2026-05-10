import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { buildCalendarHeatmapQuery } from './query'
import { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

describe('CalendarHeatmap Query', () => {
    beforeAll(async () => {
        conn = await DuckDBConnection.create()
    })

    afterAll(() => {
        conn.closeSync()
    })

    beforeEach(async () => {
        await conn.run(`
            CREATE OR REPLACE TABLE daily_stream_counts (
                day DATE,
                stream_count BIGINT,
                ms_played BIGINT
            )
        `)
        await conn.run(`
            INSERT INTO daily_stream_counts VALUES
            ('2025-01-01', 5, 900000),
            ('2025-01-15', 3, 540000),
            ('2024-12-31', 7, 1260000)
        `)
    })

    it('should filter to the specified year', async () => {
        const result = await conn.runAndReadAll(buildCalendarHeatmapQuery(2025))
        const rows = result.getRowObjectsJson()
        expect(rows).toHaveLength(2)
    })

    it('should return all days when year is undefined', async () => {
        const result = await conn.runAndReadAll(
            buildCalendarHeatmapQuery(undefined)
        )
        const rows = result.getRowObjectsJson()
        expect(rows).toHaveLength(3)
    })

    it('should return day as a YYYY-MM-DD string and stream_count as a number', async () => {
        const result = await conn.runAndReadAll(buildCalendarHeatmapQuery(2025))
        const rows = result.getRowObjectsJson()
        expect(rows[0].day).toBe('2025-01-01')
        expect(rows[0].stream_count).toBe(5)
    })

    it('should order results by day ascending', async () => {
        const result = await conn.runAndReadAll(buildCalendarHeatmapQuery(2025))
        const rows = result.getRowObjectsJson()
        expect(rows[0].day).toBe('2025-01-01')
        expect(rows[1].day).toBe('2025-01-15')
    })
})
