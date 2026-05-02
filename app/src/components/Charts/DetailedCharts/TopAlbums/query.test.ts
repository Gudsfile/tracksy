import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTopAlbumsByYear } from './query'
import { TABLE } from '../../../../db/queries/constants'
import { runQueryAndReadAll } from '../../SimpleCharts/__tests__/test-utils'

const seedPath =
    'src/components/Charts/DetailedCharts/TopAlbums/fixtures/seed.json'
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

describe('TopAlbums query', () => {
    it('returns the tracks top 10 for all years', async () => {
        const result = await runQueryAndReadAll(
            conn,
            queryTopAlbumsByYear(undefined)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                album_name: 'album_a',
                ms_played: 154,
                count_streams: 10,
            },
            {
                album_name: 'album_b',
                ms_played: 44,
                count_streams: 2,
            },
        ])
    })

    it('returns the tracks top 10 for a specific year', async () => {
        const result = await runQueryAndReadAll(
            conn,
            queryTopAlbumsByYear(2006)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            {
                album_name: 'album_a',
                ms_played: 77,
                count_streams: 5,
            },
            {
                album_name: 'album_b',
                ms_played: 22,
                count_streams: 1,
            },
        ])
    })
})
