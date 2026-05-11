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

const testYear = 2025
const anotherYear = testYear - 1

const testData: TestStreamEntry[] = [
    { ts: `${testYear}-01-01` },
    { ts: `${testYear}-01-02` },
    { ts: `${testYear}-01-03` },
    { ts: `${testYear}-01-05` },
    { ts: `${testYear}-01-06` },
    { ts: `${anotherYear}-06-01` },
    { ts: `${anotherYear}-06-02` },
    { ts: `${anotherYear}-06-03` },
    { ts: `${anotherYear}-06-04` },
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

    it('should return the longest streak for a given year', async () => {
        const rows = await testQuery(conn, buildUnbeatableStreakQuery(testYear))
        expect(rows.length).toBe(1)
        expect(rows[0].streak_days).toBe(3)
        expect(rows[0].start_date).toBe(`${testYear}-01-01`)
        expect(rows[0].end_date).toBe(`${testYear}-01-03`)
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(
            conn,
            buildUnbeatableStreakQuery(undefined)
        )
        expect(rows.length).toBe(1)
        expect(rows[0].streak_days).toBe(4)
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildUnbeatableStreakQuery(testYear))
        expect(rows.length).toBe(0)
    })
})
