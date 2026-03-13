import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10AlbumsEvolution } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath =
    'src/components/Charts/DetailedCharts/Top10AlbumsEvolution/fixtures/seed.json'
let conn: DuckDBConnection

describe('queryTop10AlbumsEvolution Query', () => {
    beforeAll(async () => {
        conn = await DuckDBConnection.create()
    })

    afterAll(() => {
        conn.closeSync()
    })

    beforeEach(async () => {
        await conn.run(
            `CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${seedPath}')`
        )
    })

    it('should return global top 10 albums evolution', async () => {
        const result = await conn.runAndReadAll(queryTop10AlbumsEvolution())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.year as number) - (b.year as number) ||
                    (a.rank as number) - (b.rank as number)
            )

        expect(rows).toEqual([
            {
                year: 2020,
                album: 'album_a',
                artist: 'artist_a',
                rank: 1,
                play_count: 3,
            },
            {
                year: 2020,
                album: 'album_b',
                artist: 'artist_b',
                rank: 2,
                play_count: 2,
            },
            {
                year: 2020,
                album: 'album_c',
                artist: 'artist_c',
                rank: 3,
                play_count: 1,
            },
            {
                year: 2021,
                album: 'album_b',
                artist: 'artist_b',
                rank: 1,
                play_count: 2,
            },
            {
                year: 2021,
                album: 'album_a',
                artist: 'artist_a',
                rank: 2,
                play_count: 1,
            },
        ])
    })
})
