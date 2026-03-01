import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryArtistDiscovery } from './query'
import { DuckDBConnection, DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/DetailedCharts/ArtistDiscovery/fixtures/seed.json'

let conn: DuckDBConnection

describe.only('ArtistDiscovery Query', () => {
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

    it.only('should return one row per year with correct discovery metrics', async () => {
        const result = await conn.runAndReadAll(queryArtistDiscovery())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) => (a.year as number) - (b.year as number)
            )

        expect(rows).toEqual([
            {
                year: 2020,
                new_artists: 2,
                cumulative_artists: 2,
                avg_listens_per_artist: 1.5,
            },
            {
                year: 2021,
                new_artists: 1,
                cumulative_artists: 3,
                avg_listens_per_artist: 1,
            },
            {
                year: 2022,
                new_artists: 0,
                cumulative_artists: 3,
                avg_listens_per_artist: 0,
            },
            {
                year: 2023,
                new_artists: 0,
                cumulative_artists: 3,
                avg_listens_per_artist: 2,
            },
        ])
    })
})
