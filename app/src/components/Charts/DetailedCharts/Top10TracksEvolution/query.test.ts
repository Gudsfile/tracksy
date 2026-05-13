import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10TracksEvolution } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath =
    'src/components/Charts/DetailedCharts/Top10TracksEvolution/fixtures/seed.json'
let conn: DuckDBConnection

describe('queryTop10TracksEvolution Query', () => {
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

    it('should return global top 10 tracks evolution', async () => {
        const result = await conn.runAndReadAll(queryTop10TracksEvolution())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.stream_year as number) - (b.stream_year as number) ||
                    (a.stream_rank as number) - (b.stream_rank as number)
            )

        expect(rows).toEqual([
            {
                artist: 'artist_b',
                play_count: 3,
                stream_rank: 1,
                track: 'track_1',
                stream_year: 2020,
            },
            {
                artist: 'artist_a',
                play_count: 2,
                stream_rank: 2,
                track: 'track_2',
                stream_year: 2020,
            },
            {
                artist: 'artist_a',
                play_count: 1,
                stream_rank: 3,
                track: 'track_1',
                stream_year: 2020,
            },
        ])
    })
})
