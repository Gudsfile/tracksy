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

    it('should return weekly play counts per artist per week', async () => {
        const result = await conn.runAndReadAll(queryTop10BillboardRace())
        const rows = result
            .getRowObjects()
            .map((r: Record<string, DuckDBValue>) => ({
                period_ts: r.period_ts,
                entity_name: r.entity_name,
                period_plays: r.period_plays,
            }))
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.entity_name as string).localeCompare(
                        b.entity_name as string
                    )
            )

        // Seed data spans two weeks:
        //   Week of 2019-12-30 (Mon): dates 2020-01-01, 2020-01-02, 2020-01-03
        //     Artist A: 3 plays, Artist B: 2 plays, Artist C: 1 play
        //   Week of 2020-12-28 (Mon): dates 2021-01-01, 2021-01-02, 2021-01-03
        //     Artist B: 2 plays, Artist A: 1 play
        const week1Ts = 1577664000000 // 2019-12-30T00:00:00.000Z
        const week2Ts = 1609113600000 // 2020-12-28T00:00:00.000Z

        expect(rows).toEqual([
            { period_ts: week1Ts, entity_name: 'Artist A', period_plays: 3 },
            { period_ts: week1Ts, entity_name: 'Artist B', period_plays: 2 },
            { period_ts: week1Ts, entity_name: 'Artist C', period_plays: 1 },
            { period_ts: week2Ts, entity_name: 'Artist A', period_plays: 1 },
            { period_ts: week2Ts, entity_name: 'Artist B', period_plays: 2 },
        ])
    })

    it('should return weekly play counts per track per week', async () => {
        const result = await conn.runAndReadAll(
            queryTop10BillboardRace(undefined, 'tracks')
        )
        const rows = result
            .getRowObjects()
            .map((r: Record<string, DuckDBValue>) => ({
                period_ts: r.period_ts,
                entity_name: r.entity_name,
                period_plays: r.period_plays,
            }))
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.entity_name as string).localeCompare(
                        b.entity_name as string
                    )
            )

        const week1Ts = 1577664000000
        const week2Ts = 1609113600000

        expect(rows).toEqual([
            {
                period_ts: week1Ts,
                entity_name: 'Track A — Artist A',
                period_plays: 3,
            },
            {
                period_ts: week1Ts,
                entity_name: 'Track B — Artist B',
                period_plays: 2,
            },
            {
                period_ts: week1Ts,
                entity_name: 'Track C — Artist C',
                period_plays: 1,
            },
            {
                period_ts: week2Ts,
                entity_name: 'Track A — Artist A',
                period_plays: 1,
            },
            {
                period_ts: week2Ts,
                entity_name: 'Track B — Artist B',
                period_plays: 2,
            },
        ])
    })

    it('should return weekly play counts per album per week', async () => {
        const result = await conn.runAndReadAll(
            queryTop10BillboardRace(undefined, 'albums')
        )
        const rows = result
            .getRowObjects()
            .map((r: Record<string, DuckDBValue>) => ({
                period_ts: r.period_ts,
                entity_name: r.entity_name,
                period_plays: r.period_plays,
            }))
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) =>
                    (a.period_ts as number) - (b.period_ts as number) ||
                    (a.entity_name as string).localeCompare(
                        b.entity_name as string
                    )
            )

        const week1Ts = 1577664000000
        const week2Ts = 1609113600000

        expect(rows).toEqual([
            { period_ts: week1Ts, entity_name: 'Album A', period_plays: 5 },
            { period_ts: week1Ts, entity_name: 'Album B', period_plays: 1 },
            { period_ts: week2Ts, entity_name: 'Album A', period_plays: 3 },
        ])
    })
})
