import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryNewVsOld } from './query'
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
    { ts: '2025-01-01', artist_name: 'new_artist' },
    { ts: '2025-01-01', artist_name: 'old_artist' },
    { ts: '2022-01-02', artist_name: 'old_artist' },
    { ts: '2022-01-02', artist_name: 'old_artist' },
    // Future data should not be taken into account
    { ts: '2026-01-01', artist_name: 'future_artist' },
]

describe('NewVsOld Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return new vs old metrics', async () => {
        const rows = await testQuery(conn, queryNewVsOld(2025))

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.new_artists_count).toBe(1)
        expect(row.new_artists_streams).toBe(1)
        expect(row.old_artists_streams).toBe(1)
        expect(row.total).toBe(1 + 1)
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(conn, queryNewVsOld(undefined))
        // All years included; "new" = discovered in the latest year (2026)
        expect(rows.length).toBe(1)
        expect(rows[0].total).toBe(5)
    })
})
