import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10Evolution } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath =
    'src/components/Charts/LabCharts/Top10Evolution/fixtures/seed.json'
let conn: DuckDBConnection

describe('Top10Evolution Query', () => {
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

    it('should return cumulative stream counts per artist per day', async () => {
        const result = await conn.runAndReadAll(queryTop10Evolution())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.stream_date_ts as number) - (b.stream_date_ts as number) ||
                    (a.artist as string).localeCompare(b.artist as string)
            )

        expect(rows).toEqual([
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                artist: 'Artist A',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                artist: 'Artist C',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-02').getTime(),
                artist: 'Artist A',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2020-01-03').getTime(),
                artist: 'Artist B',
                play_count: 2,
            },
            {
                stream_date_ts: new Date('2021-01-01').getTime(),
                artist: 'Artist B',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2021-01-02').getTime(),
                artist: 'Artist B',
                play_count: 4,
            },
            {
                stream_date_ts: new Date('2021-01-03').getTime(),
                artist: 'Artist A',
                play_count: 4,
            },
        ])
    })
})
