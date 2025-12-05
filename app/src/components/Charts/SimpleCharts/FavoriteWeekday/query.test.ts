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
    { ts: '2025-12-01' }, // Monday
    { ts: '2025-12-01' },
    { ts: '2025-12-02' },
    { ts: '2025-12-03' },
    { ts: '2025-12-04' },
    { ts: '2025-12-05' },
    { ts: '2025-12-06' },
    { ts: '2025-12-07' },
    // Another year
    { ts: '2024-12-01' },
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
            { day_name: 'Monday', stream_count: 2, pct: 25 },
            { day_name: 'Tuesday', stream_count: 1, pct: 12.5 },
            { day_name: 'Wednesday', stream_count: 1, pct: 12.5 },
            { day_name: 'Thursday', stream_count: 1, pct: 12.5 },
            { day_name: 'Friday', stream_count: 1, pct: 12.5 },
            { day_name: 'Saturday', stream_count: 1, pct: 12.5 },
            { day_name: 'Sunday', stream_count: 1, pct: 12.5 },
        ])

        const totalPct = rows.reduce((sum, row) => sum + (row.pct as number), 0)
        expect(totalPct).toBe(100)
    })
})
