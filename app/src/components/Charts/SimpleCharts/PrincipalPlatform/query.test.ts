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

const testData: TestStreamEntry[] = [
    { platform: 'android' },
    { platform: 'ios' },
    { platform: 'dummy1' },
    { platform: 'dummy2' },
    { platform: 'dummy3' },
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
        const rows = await testQuery(conn, queryPrincipalPlatform())

        expect(rows).toEqual([
            { pct: 20, platform: 'iOS', stream_count: 1 },
            { pct: 20, platform: 'Android OS', stream_count: 1 },
            { pct: 60, platform: 'Others', stream_count: 3 },
        ])

        const totalPct = rows.reduce((sum, row) => sum + (row.pct as number), 0)
        expect(totalPct).toBe(100)
    })
})
