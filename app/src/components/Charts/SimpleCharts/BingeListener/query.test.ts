import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { buildBingeListenerQuery } from './query'
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
    { ts: '2025-01-01', ms_played: 3600000 },
    { ts: '2025-01-01', ms_played: 3600000 },
    { ts: '2025-01-02', ms_played: 1800000 },
]

describe('BingeListener Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return the day with the most hours played', async () => {
        const rows = await testQuery(conn, buildBingeListenerQuery())
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe('2025-01-01')
        expect(rows[0].hours_played).toBeCloseTo(2.0)
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildBingeListenerQuery())
        expect(rows.length).toBe(0)
    })
})
