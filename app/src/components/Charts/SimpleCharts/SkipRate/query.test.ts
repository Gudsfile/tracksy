import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { querySkipRate } from './query'
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
const testDate = `${testYear}-01-01`
const anotherYear = testYear - 1
const testData: TestStreamEntry[] = [
    { ts: testDate, reason_end: 'fwdbtn' },
    { ts: testDate, reason_end: 'trackdone' },
    { ts: testDate, reason_end: 'trackdone' },
    { ts: testDate, reason_end: 'trackdone' },
    { ts: `${anotherYear}-01-01`, reason_end: 'trackdone' },
]

describe('SkipRate Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return skip rate metrics', async () => {
        const rows = await testQuery(conn, querySkipRate(testYear))

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.complete_listens).toBe(3)
        expect(row.skipped_listens).toBe(1)
    })
})
