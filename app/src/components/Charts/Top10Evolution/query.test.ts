import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTop10Evolution } from './query'
import { DuckDBConnection, DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../db/queries/constants'
const seedPath = 'src/components/Charts/Top10Evolution/fixtures/seed.json'
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

    it('should return global top 10 artists evolution', async () => {
        const result = await conn.runAndReadAll(queryTop10Evolution())
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
                artist: 'Artist A',
                rank: 1,
                play_count: 3,
            },
            {
                year: 2020,
                artist: 'Artist B',
                rank: 2,
                play_count: 2,
            },
            {
                year: 2020,
                artist: 'Artist C',
                rank: 3,
                play_count: 1,
            },
            {
                year: 2021,
                artist: 'Artist B',
                rank: 1,
                play_count: 2,
            },
            {
                year: 2021,
                artist: 'Artist A',
                rank: 2,
                play_count: 1,
            },
        ])
    })
})
