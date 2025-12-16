import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryStreaks } from './query'
import { DuckDBConnection, DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const seedPath = 'src/components/Charts/ExpertCharts/Streaks/fixtures/seed.json'
let conn: DuckDBConnection

describe('Streaks Query', () => {
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

    it('should return streaks', async () => {
        const result = await conn.runAndReadAll(queryStreaks())
        const rows = result
            .getRowObjects()
            .toSorted(
                (
                    a: Record<string, DuckDBValue>,
                    b: Record<string, DuckDBValue>
                ) => ((a.day as string) < (b.day as string) ? -1 : 1)
            )

        expect(rows).toEqual([
            {
                day: '2020-01-01',
                played: 1,
            },
            {
                day: '2020-01-02',
                played: 1,
            },
            {
                day: '2020-01-03',
                played: 1,
            },
            {
                day: '2020-01-10',
                played: 1,
            },
            {
                day: '2020-01-11',
                played: 1,
            },
        ])
    })
})
