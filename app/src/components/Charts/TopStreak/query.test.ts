import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { query } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/TopStreak/fixtures/seed.json'
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

describe('TopStreak query', () => {
    it('returns the longest streak', async () => {
        const result = await conn.runAndReadAll(query())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.streaks).toBe('4')
        expect(row.start_ts).toBe('2024-02-09')
        expect(row.end_ts).toBe('2024-02-12')
    })
})
