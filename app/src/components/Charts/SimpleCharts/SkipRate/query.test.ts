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

const testData: TestStreamEntry[] = [
    { reason_end: 'fwdbtn' },
    { reason_end: 'trackdone' },
    { reason_end: 'trackdone' },
    { reason_end: 'trackdone' },
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
        const rows = await testQuery(conn, querySkipRate())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.complete_listens).toBe(3)
        expect(row.skipped_listens).toBe(1)
    })
})
