import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/SummaryPerYear/fixtures/seed.json'
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

describe('SummaryPerYear query', () => {
    it('counts the distribution of streams during the year for all years', async () => {
        const result = await conn.runAndReadAll(queryByYear(undefined))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { year: 2006, type: 'new_unique', count_streams: 3 },
            { year: 2006, type: 'new_repeat', count_streams: 3 },
            { year: 2006, type: 'old_unique', count_streams: 0 },
            { year: 2006, type: 'old_repeat', count_streams: 0 },
            { year: 2025, type: 'new_unique', count_streams: 0 },
            { year: 2025, type: 'new_repeat', count_streams: 0 },
            { year: 2025, type: 'old_unique', count_streams: 3 },
            { year: 2025, type: 'old_repeat', count_streams: 3 },
        ])
    })

    it('counts the distribution of streams during the year for a specific year', async () => {
        const result = await conn.runAndReadAll(queryByYear(2006))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { year: 2006, type: 'new_unique', count_streams: 3 },
            { year: 2006, type: 'new_repeat', count_streams: 3 },
            { year: 2006, type: 'old_unique', count_streams: 0 },
            { year: 2006, type: 'old_repeat', count_streams: 0 },
        ])
    })
})
