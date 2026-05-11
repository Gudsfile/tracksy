import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryFavoriteWeekday } from './query'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

const testData: TestStreamEntry[] = [
    { ts: '2025-12-01', ms_played: 60000 }, // Monday
    { ts: '2025-12-01', ms_played: 30000 },
    { ts: '2025-12-02', ms_played: 45000 }, // Tuesday
    { ts: '2025-12-03', ms_played: 72000 }, // Wednesday
    { ts: '2025-12-04', ms_played: 36000 }, // Thursday
    { ts: '2025-12-05', ms_played: 90000 }, // Friday
    { ts: '2025-12-06', ms_played: 15000 }, // Saturday
    { ts: '2025-12-07', ms_played: 80000 }, // Sunday
    // Another year
    { ts: '2024-12-01', ms_played: 10000 },
]

describe('FavoriteWeekday Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return weekday statistics', async () => {
        const rows = await testQuery(conn, queryFavoriteWeekday(2025))

        expect(rows).toEqual([
            { day_name: 'Monday', stream_count: 2, ms_played: 90000, pct: 25 },
            {
                day_name: 'Tuesday',
                stream_count: 1,
                ms_played: 45000,
                pct: 12.5,
            },
            {
                day_name: 'Wednesday',
                stream_count: 1,
                ms_played: 72000,
                pct: 12.5,
            },
            {
                day_name: 'Thursday',
                stream_count: 1,
                ms_played: 36000,
                pct: 12.5,
            },
            {
                day_name: 'Friday',
                stream_count: 1,
                ms_played: 90000,
                pct: 12.5,
            },
            {
                day_name: 'Saturday',
                stream_count: 1,
                ms_played: 15000,
                pct: 12.5,
            },
            {
                day_name: 'Sunday',
                stream_count: 1,
                ms_played: 80000,
                pct: 12.5,
            },
        ])

        const totalPct = rows.reduce((sum, row) => sum + (row.pct as number), 0)
        expect(totalPct).toBe(100)
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(conn, queryFavoriteWeekday(undefined))
        // 2024-12-01 is a Sunday, so total streams increases from 8 to 9
        const total = rows.reduce(
            (sum, row) => sum + (row.stream_count as number),
            0
        )
        expect(total).toBe(9)
        const totalPct = rows.reduce((sum, row) => sum + (row.pct as number), 0)
        expect(totalPct).toBe(100)
    })
})
