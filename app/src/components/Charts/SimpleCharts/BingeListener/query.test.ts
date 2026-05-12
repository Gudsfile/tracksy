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

const testYear = 2025
const anotherYear = testYear - 1

const testData: TestStreamEntry[] = [
    { ts: `${testYear}-01-01`, ms_played: 3600000 },
    { ts: `${testYear}-01-01`, ms_played: 3600000 },
    { ts: `${testYear}-01-02`, ms_played: 1800000 },
    { ts: `${anotherYear}-06-01`, ms_played: 7200000 },
    { ts: `${anotherYear}-06-01`, ms_played: 7200000 },
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

    it('should return the heaviest listening day for a given year', async () => {
        const rows = await testQuery(conn, buildBingeListenerQuery(testYear))
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe(`${testYear}-01-01`)
        expect(rows[0].hours_played).toBeCloseTo(2.0)
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(conn, buildBingeListenerQuery(undefined))
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe(`${anotherYear}-06-01`)
        expect(rows[0].hours_played).toBeCloseTo(4.0)
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildBingeListenerQuery(testYear))
        expect(rows.length).toBe(0)
    })
})
