import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { queryRegularity } from './query'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

describe('Regularity Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    it('should return regularity metrics', async () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01' },
            { ts: '2024-01-02' },
            { ts: '2024-01-05' },
        ]
        await createTestTable(conn, testData)

        const rows = await testQuery(conn, queryRegularity())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.days_with_streams).toBe(3)
        expect(row.total_days).toBe(5)
        expect(row.longest_pause_days).toBe(2)
    })

    it('should return regularity metric without pauses', async () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01' },
            { ts: '2024-01-02' },
            { ts: '2024-01-03' },
        ]
        await createTestTable(conn, testData)

        const rows = await testQuery(conn, queryRegularity())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.days_with_streams).toBe(3)
        expect(row.total_days).toBe(3)
        expect(row.longest_pause_days).toBe(0)
    })
})
