import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10BillboardRace } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath =
    'src/components/Charts/LabCharts/Top10BillboardRace/fixtures/seed.json'
let conn: DuckDBConnection

describe('Top10BillboardRace Query', () => {
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

    it('should return cumulative weeks in top 10 per artist per week', async () => {
        const result = await conn.runAndReadAll(queryTop10BillboardRace())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        // Seed data spans two weeks:
        //   Week of 2019-12-30 (Mon): dates 2020-01-01, 2020-01-02, 2020-01-03
        //     Artist A: 3 plays, Artist B: 2 plays, Artist C: 1 play → all 3 in top 10
        //   Week of 2020-12-28 (Mon): dates 2021-01-01, 2021-01-02, 2021-01-03
        //     Artist B: 3 plays, Artist A: 1 play → both in top 10
        const week1Ts = 1577664000000 // 2019-12-30T00:00:00.000Z
        const week2Ts = 1609113600000 // 2020-12-28T00:00:00.000Z

        expect(rows).toEqual([
            { period_ts: week1Ts, label: 'Artist A', periods_in_top10: 1 },
            { period_ts: week1Ts, label: 'Artist B', periods_in_top10: 1 },
            { period_ts: week1Ts, label: 'Artist C', periods_in_top10: 1 },
            { period_ts: week2Ts, label: 'Artist A', periods_in_top10: 2 },
            { period_ts: week2Ts, label: 'Artist B', periods_in_top10: 2 },
        ])
    })

    it('should return cumulative weeks in top 10 per track per week', async () => {
        const result = await conn.runAndReadAll(
            queryTop10BillboardRace(undefined, 'tracks')
        )
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        const week1Ts = 1577664000000
        const week2Ts = 1609113600000

        expect(rows).toEqual([
            {
                period_ts: week1Ts,
                label: 'Track A — Artist A',
                periods_in_top10: 1,
            },
            {
                period_ts: week1Ts,
                label: 'Track B — Artist B',
                periods_in_top10: 1,
            },
            {
                period_ts: week1Ts,
                label: 'Track C — Artist C',
                periods_in_top10: 1,
            },
            {
                period_ts: week2Ts,
                label: 'Track A — Artist A',
                periods_in_top10: 2,
            },
            {
                period_ts: week2Ts,
                label: 'Track B — Artist B',
                periods_in_top10: 2,
            },
        ])
    })

    it('should return cumulative weeks in top 10 per album per week', async () => {
        const result = await conn.runAndReadAll(
            queryTop10BillboardRace(undefined, 'albums')
        )
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.label as string).localeCompare(b.label as string)
            )

        const week1Ts = 1577664000000
        const week2Ts = 1609113600000

        expect(rows).toEqual([
            { period_ts: week1Ts, label: 'Album A', periods_in_top10: 1 },
            { period_ts: week1Ts, label: 'Album B', periods_in_top10: 1 },
            { period_ts: week2Ts, label: 'Album A', periods_in_top10: 2 },
        ])
    })
})
