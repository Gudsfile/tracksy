import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryListeningRhythm } from './query'
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
    { ts: '2024-01-01 04:00:00' },
    { ts: '2024-01-01 08:00:00' },
    { ts: '2024-01-01 12:00:00' },
    { ts: '2024-01-01 16:00:00' },
    { ts: '2024-01-01 20:00:00' },
    { ts: '2024-01-01 22:00:00' },
    { ts: '2024-01-01 23:00:00' },
]

describe('ListeningRhythm Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return rhythm metrics', async () => {
        const rows = await testQuery(conn, queryListeningRhythm())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.morning).toBe(1)
        expect(row.afternoon).toBe(2)
        expect(row.evening).toBe(1)
        expect(row.night).toBe(3)
        expect(row.total).toBe(7)
    })
})
