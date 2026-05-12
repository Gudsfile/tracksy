import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { buildVarietyDayQuery } from './query'
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
    { ts: `${testYear}-01-01`, artist_name: 'Artist A' },
    { ts: `${testYear}-01-01`, artist_name: 'Artist B' },
    { ts: `${testYear}-01-01`, artist_name: 'Artist C' },
    { ts: `${testYear}-01-02`, artist_name: 'Artist A' },
    { ts: `${anotherYear}-06-01`, artist_name: 'Artist A' },
    { ts: `${anotherYear}-06-01`, artist_name: 'Artist B' },
    { ts: `${anotherYear}-06-01`, artist_name: 'Artist C' },
    { ts: `${anotherYear}-06-01`, artist_name: 'Artist D' },
    { ts: `${anotherYear}-06-01`, artist_name: 'Artist E' },
]

describe('VarietyDay Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return the most diverse day for a given year', async () => {
        const rows = await testQuery(conn, buildVarietyDayQuery(testYear))
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe(`${testYear}-01-01`)
        expect(rows[0].artist_count).toBe(3)
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(conn, buildVarietyDayQuery(undefined))
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe(`${anotherYear}-06-01`)
        expect(rows[0].artist_count).toBe(5)
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildVarietyDayQuery(testYear))
        expect(rows.length).toBe(0)
    })
})
