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

const testData: TestStreamEntry[] = [
    { ts: '2025-01-01', artist_name: 'Artist A' },
    { ts: '2025-01-01', artist_name: 'Artist B' },
    { ts: '2025-01-01', artist_name: 'Artist C' },
    { ts: '2025-01-02', artist_name: 'Artist A' },
    { ts: '2025-01-02', artist_name: 'Artist B' },
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

    it('should return the day with the most distinct artists', async () => {
        const rows = await testQuery(conn, buildVarietyDayQuery())
        expect(rows.length).toBe(1)
        expect(rows[0].date).toBe('2025-01-01')
        expect(rows[0].artist_count).toBe(3)
    })

    it('should return empty when no data', async () => {
        await createTestTable(conn, [])
        const rows = await testQuery(conn, buildVarietyDayQuery())
        expect(rows.length).toBe(0)
    })
})
