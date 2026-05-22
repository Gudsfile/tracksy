import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10Race } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath = 'src/components/Charts/LabCharts/Top10Race/fixtures/seed.json'
let conn: DuckDBConnection

describe('Top10Race Query', () => {
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
        const result = await conn.runAndReadAll(queryTop10Race())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.stream_date_ts as number) -
                        (b.stream_date_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        expect(rows).toEqual([
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Artist A',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Artist C',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-02').getTime(),
                label: 'Artist A',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2020-01-03').getTime(),
                label: 'Artist B',
                play_count: 2,
            },
            {
                stream_date_ts: new Date('2021-01-01').getTime(),
                label: 'Artist B',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2021-01-02').getTime(),
                label: 'Artist B',
                play_count: 4,
            },
            {
                stream_date_ts: new Date('2021-01-03').getTime(),
                label: 'Artist A',
                play_count: 4,
            },
        ])
    })

    it('should return cumulative stream counts per track per day', async () => {
        const result = await conn.runAndReadAll(
            queryTop10Race(undefined, 'tracks')
        )
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.stream_date_ts as number) -
                        (b.stream_date_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        expect(rows).toEqual([
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Track A — Artist A',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Track C — Artist C',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-02').getTime(),
                label: 'Track A — Artist A',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2020-01-03').getTime(),
                label: 'Track B — Artist B',
                play_count: 2,
            },
            {
                stream_date_ts: new Date('2021-01-01').getTime(),
                label: 'Track B — Artist B',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2021-01-02').getTime(),
                label: 'Track B — Artist B',
                play_count: 4,
            },
            {
                stream_date_ts: new Date('2021-01-03').getTime(),
                label: 'Track A — Artist A',
                play_count: 4,
            },
        ])
    })

    it('should return cumulative stream counts per album per day', async () => {
        const result = await conn.runAndReadAll(
            queryTop10Race(undefined, 'albums')
        )
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.stream_date_ts as number) -
                        (b.stream_date_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        expect(rows).toEqual([
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Album A',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-01').getTime(),
                label: 'Album B',
                play_count: 1,
            },
            {
                stream_date_ts: new Date('2020-01-02').getTime(),
                label: 'Album A',
                play_count: 3,
            },
            {
                stream_date_ts: new Date('2020-01-03').getTime(),
                label: 'Album A',
                play_count: 5,
            },
            {
                stream_date_ts: new Date('2021-01-01').getTime(),
                label: 'Album A',
                play_count: 6,
            },
            {
                stream_date_ts: new Date('2021-01-02').getTime(),
                label: 'Album A',
                play_count: 7,
            },
            {
                stream_date_ts: new Date('2021-01-03').getTime(),
                label: 'Album A',
                play_count: 8,
            },
        ])
    })
})
