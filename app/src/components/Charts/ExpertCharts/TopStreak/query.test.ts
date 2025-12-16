import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTopStreak, queryCurrentStreak } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/ExpertCharts/TopStreak/fixtures/seed.json'
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
    it('queryTopStreak returns the longest streak', async () => {
        const result = await conn.runAndReadAll(queryTopStreak())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.streaks).toBe(5)
        expect(row.start_ts).toBe('2025-01-01')
        expect(row.end_ts).toBe('2025-01-05')
    })

    it('queryCurrentStreak returns the most recent streak', async () => {
        const result = await conn.runAndReadAll(queryCurrentStreak())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.streaks).toBe(3)
        expect(row.start_ts).toBe('2025-10-17')
        expect(row.end_ts).toBe('2025-10-19')
    })
})
