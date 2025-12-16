import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTotalStreams } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/ExpertCharts/TotalStreams/fixtures/seed.json'
let conn: DuckDBConnection

beforeAll(async () => {
    conn = await DuckDBConnection.create()
})

afterAll(() => {
    conn.closeSync()
})

beforeEach(async () => {
    await conn.run(`CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${seedPath}')`)
})

describe('TotalStreams query', () => {
    it('returns the total number of streams', async () => {
        const result = await conn.runAndReadAll(queryTotalStreams())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.count_streams).toBe(3)
        expect(row.ms_played).toBe(6)
    })
})
