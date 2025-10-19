import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTopArtistByCount, queryTopArtistByDuration } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/TopArtist/fixtures/seed.json'
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

describe('TopArtist query', () => {
    it('returns the top artist by count', async () => {
        const result = await conn.runAndReadAll(queryTopArtistByCount())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.artist_name).toBe('Artist A')
        expect(row.count_streams).toBe(3)
        expect(row.ms_played).toBe(3)
    })
    it('returns the top artist by duration', async () => {
        const result = await conn.runAndReadAll(queryTopArtistByDuration())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.artist_name).toBe('Artist C')
        expect(row.count_streams).toBe(1)
        expect(row.ms_played).toBe(4)
    })
})
