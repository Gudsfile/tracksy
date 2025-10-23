import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/TopArtists/fixtures/seed.json'
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

describe('TopArtists query', () => {
    it('returns the tracks top 10 for all years', async () => {
        const result = await conn.runAndReadAll(queryByYear(undefined))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                artist_name: 'artist_a',
                ms_played: 154n,
                count_streams: 10n,
            },
            {
                artist_name: 'artist_b',
                ms_played: 44n,
                count_streams: 2n,
            },
        ])
    })

    it('returns the tracks top 10 for a specific year', async () => {
        const result = await conn.runAndReadAll(queryByYear(2006))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                artist_name: 'artist_a',
                ms_played: 77n,
                count_streams: 5n,
            },
            {
                artist_name: 'artist_b',
                ms_played: 22n,
                count_streams: 1n,
            },
        ])
    })
})
