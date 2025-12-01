import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { querySeasonalPatterns } from './query'
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
    { ts: '2022-02-01' },
    { ts: '2022-03-01' },
    { ts: '2022-04-01' },
    { ts: '2022-05-01' },
    { ts: '2022-07-01' },
    { ts: '2022-08-01' },
]

describe('SeasonalPatterns Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return seasonal metrics', async () => {
        const rows = await testQuery(conn, querySeasonalPatterns())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.winter).toBe(1)
        expect(row.spring).toBe(3)
        expect(row.summer).toBe(2)
        expect(row.fall).toBe(0)
        expect(row.total).toBe(6)
    })
})
