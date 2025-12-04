import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryEvolutionOverTime } from './query'
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
    { ts: '2006-01-01', ms_played: 1 },
    { ts: '2018-01-01', ms_played: 2 },
    { ts: '2024-01-01', ms_played: 3 },
    { ts: '2024-02-01', ms_played: 4 },
    { ts: '2025-01-01', ms_played: 5 },
]

describe('EvolutionOverTime Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return evolution metrics', async () => {
        const rows = await testQuery(conn, queryEvolutionOverTime())

        expect(rows).toEqual([
            { year: 2006, streams: 1, ms_played: 1 },
            { year: 2018, streams: 1, ms_played: 2 },
            { year: 2024, streams: 2, ms_played: 7 },
            { year: 2025, streams: 1, ms_played: 5 },
        ])
    })
})
