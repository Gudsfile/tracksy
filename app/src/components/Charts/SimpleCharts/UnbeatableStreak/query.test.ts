import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { buildUnbeatableStreakQuery } from './query'
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
    { ts: '2025-01-01' },
    { ts: '2025-01-02' },
    { ts: '2025-01-03' },
    { ts: '2025-01-05' },
    { ts: '2025-01-06' },
]

describe('UnbeatableStreak Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return the longest streak', async () => {
        const rows = await testQuery(conn, buildUnbeatableStreakQuery())
        expect(rows.length).toBe(1)
        expect(rows[0].streak_days).toBe(3)
        expect(rows[0].start_date).toBe('2025-01-01')
        expect(rows[0].end_date).toBe('2025-01-03')
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildUnbeatableStreakQuery())
        expect(rows.length).toBe(0)
    })
})
