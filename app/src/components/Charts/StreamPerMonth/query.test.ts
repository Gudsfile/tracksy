import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/StreamPerMonth/fixtures/seed.json'
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

describe('StreamPerMonth query', () => {
    it('returns listening times by date for all years', async () => {
        const result = await conn.runAndReadAll(queryByYear(undefined))
        const rows = result.getRowObjectsJson()
        expect(rows).toEqual([
            { ts: '2006-01-17', ms_played: 3.3 },
            { ts: '2006-04-20', ms_played: 2.2 },
            { ts: '2006-06-01', ms_played: 1.1 },
            { ts: '2006-10-13', ms_played: 1.1 },
            { ts: '2006-10-27', ms_played: 1.1 },
            { ts: '2006-12-09', ms_played: 1.1 },
            { ts: '2025-12-09', ms_played: 1.1 },
        ])
    })

    it('returns listening times by date for a specific year', async () => {
        const result = await conn.runAndReadAll(queryByYear(2006))
        const rows = result.getRowObjectsJson()
        expect(rows).toEqual([
            { ts: '2006-01-17', ms_played: 3.3 },
            { ts: '2006-04-20', ms_played: 2.2 },
            { ts: '2006-06-01', ms_played: 1.1 },
            { ts: '2006-10-13', ms_played: 1.1 },
            { ts: '2006-10-27', ms_played: 1.1 },
            { ts: '2006-12-09', ms_played: 1.1 },
        ])
    })
})
