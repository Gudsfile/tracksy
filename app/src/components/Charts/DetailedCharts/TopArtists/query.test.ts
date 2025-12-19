import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTopArtistsByYear } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/DetailedCharts/TopArtists/fixtures/seed.json'
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
        const result = await conn.runAndReadAll(
            queryTopArtistsByYear(undefined)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                artist_name: 'artist_a',
                ms_played: 154,
                count_streams: 10,
            },
            {
                artist_name: 'artist_b',
                ms_played: 44,
                count_streams: 2,
            },
        ])
    })

    it('returns the tracks top 10 for a specific year', async () => {
        const result = await conn.runAndReadAll(queryTopArtistsByYear(2006))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                artist_name: 'artist_a',
                ms_played: 77,
                count_streams: 5,
            },
            {
                artist_name: 'artist_b',
                ms_played: 22,
                count_streams: 1,
            },
        ])
    })
})
