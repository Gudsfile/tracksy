import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/TopTracks/fixtures/seed.json'
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

describe('TopTracks query', () => {
    it('returns the tracks top 10 for all years', async () => {
        const result = await conn.runAndReadAll(queryByYear(undefined))
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                track_name: 'track_a',
                artist_name: 'artist_a',
                ms_played: 88n,
                count_streams: 8n,
            },
            {
                track_name: 'track_b',
                artist_name: 'artist_a',
                ms_played: 66n,
                count_streams: 2n,
            },
            {
                track_name: 'track_a',
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
                track_name: 'track_a',
                artist_name: 'artist_a',
                ms_played: 44n,
                count_streams: 4n,
            },
            {
                track_name: 'track_b',
                artist_name: 'artist_a',
                ms_played: 33n,
                count_streams: 1n,
            },
            {
                track_name: 'track_a',
                artist_name: 'artist_b',
                ms_played: 22n,
                count_streams: 1n,
            },
        ])
    })
})
