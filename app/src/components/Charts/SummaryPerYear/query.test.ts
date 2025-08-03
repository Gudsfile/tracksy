import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { query } from './query'
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
    it('counts the distribution of streams during the year', async () => {
        const result = await conn.runAndReadAll(query)
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { year: 2006, type: 'count_new_tracks_played', count_streams: 3 },
            { year: 2006, type: 'count_unique_track_played', count_streams: 0 },
            { year: 2006, type: 'count_other_tracks_played', count_streams: 3 },
            { year: 2025, type: 'count_new_tracks_played', count_streams: 0 },
            { year: 2025, type: 'count_unique_track_played', count_streams: 3 },
            { year: 2025, type: 'count_other_tracks_played', count_streams: 3 },
        ])
    })
})
