import { afterAll, beforeAll, describe, it, expect } from 'vitest'
import { queryAllTimeTop10Evolution } from './query'
import { DuckDBConnection, type DuckDBValue } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'
const fixturesPath =
    'src/components/Charts/LabCharts/AllTimeTop10Evolution/fixtures'
const seedPath = `${fixturesPath}/seed.json`
// An album listen needs 7 distinct tracks on the same day, so albums use a dedicated seed
const albumsSeedPath = `${fixturesPath}/albums-seed.json`
let conn: DuckDBConnection

async function seed(path: string) {
    await conn.run(`CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${path}')`)
}

async function runQuery(query: string) {
    const result = await conn.runAndReadAll(query)
    return result
        .getRowObjects()
        .toSorted(
            (a: Record<string, DuckDBValue>, b: Record<string, DuckDBValue>) =>
                (a.stream_year as number) - (b.stream_year as number) ||
                (a.stream_rank as number) - (b.stream_rank as number)
        )
}

describe('AllTimeTop10Evolution Query', () => {
    beforeAll(async () => {
        conn = await DuckDBConnection.create()
    })

    afterAll(() => {
        conn.closeSync()
    })

    it('should return global top 10 artists evolution', async () => {
        await seed(seedPath)
        const rows = await runQuery(queryAllTimeTop10Evolution())

        expect(rows).toEqual([
            {
                stream_year: 2020,
                entity_name: 'Artist A',
                stream_rank: 1,
                play_count: 3,
            },
            {
                stream_year: 2020,
                entity_name: 'Artist B',
                stream_rank: 2,
                play_count: 2,
            },
            {
                stream_year: 2020,
                entity_name: 'Artist C',
                stream_rank: 3,
                play_count: 1,
            },
            {
                stream_year: 2021,
                entity_name: 'Artist B',
                stream_rank: 1,
                play_count: 2,
            },
            {
                stream_year: 2021,
                entity_name: 'Artist A',
                stream_rank: 2,
                play_count: 1,
            },
        ])
    })

    it('should return global top 10 tracks evolution', async () => {
        await seed(seedPath)
        const rows = await runQuery(
            queryAllTimeTop10Evolution(undefined, 'tracks')
        )

        expect(rows).toEqual([
            {
                stream_year: 2020,
                entity_name: 'Track 1 — Artist A',
                stream_rank: 1,
                play_count: 3,
            },
            {
                stream_year: 2020,
                entity_name: 'Track 2 — Artist B',
                stream_rank: 2,
                play_count: 2,
            },
            {
                stream_year: 2020,
                entity_name: 'Track 3 — Artist C',
                stream_rank: 3,
                play_count: 1,
            },
            {
                stream_year: 2021,
                entity_name: 'Track 2 — Artist B',
                stream_rank: 1,
                play_count: 2,
            },
            {
                stream_year: 2021,
                entity_name: 'Track 1 — Artist A',
                stream_rank: 2,
                play_count: 1,
            },
        ])
    })

    it('should return global top 10 albums evolution', async () => {
        await seed(albumsSeedPath)
        const rows = await runQuery(
            queryAllTimeTop10Evolution(undefined, 'albums')
        )

        // Album Z is excluded: only 6 distinct tracks played that day
        expect(rows).toEqual([
            {
                stream_year: 2020,
                entity_name: 'Album X — Artist X',
                stream_rank: 1,
                play_count: 2,
            },
            {
                stream_year: 2020,
                entity_name: 'Album Y — Artist Y',
                stream_rank: 2,
                play_count: 1,
            },
            {
                stream_year: 2021,
                entity_name: 'Album Y — Artist Y',
                stream_rank: 1,
                play_count: 2,
            },
        ])
    })

    it('should exclude years after the selected year', async () => {
        await seed(albumsSeedPath)
        const rows = await runQuery(queryAllTimeTop10Evolution(2020, 'albums'))

        expect(rows).toEqual([
            {
                stream_year: 2020,
                entity_name: 'Album X — Artist X',
                stream_rank: 1,
                play_count: 2,
            },
            {
                stream_year: 2020,
                entity_name: 'Album Y — Artist Y',
                stream_rank: 2,
                play_count: 1,
            },
        ])
    })
})
