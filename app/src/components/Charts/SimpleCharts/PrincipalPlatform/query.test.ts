import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryPrincipalPlatform } from './query'
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
const anotherYear = `${testYear - 1}-01-01`
const testData: TestStreamEntry[] = [
    { ts: testDate, platform: 'android' },
    { ts: testDate, platform: 'ios' },
    { ts: testDate, platform: 'dummy1' },
    { ts: testDate, platform: 'dummy2' },
    { ts: testDate, platform: 'dummy3' },
    { ts: anotherYear, platform: 'android' },
]

describe('PrincipalPlatform Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return platform metrics', async () => {
        const rows = await testQuery(conn, queryPrincipalPlatform(testYear))

        expect(rows).toEqual([
            { pct: 20, platform: 'iOS', stream_count: 1 },
            { pct: 20, platform: 'Android OS', stream_count: 1 },
            { pct: 60, platform: 'Others', stream_count: 3 },
        ])

        const totalPct = rows.reduce((sum, row) => sum + (row.pct as number), 0)
        expect(totalPct).toBe(100)
    })
})
