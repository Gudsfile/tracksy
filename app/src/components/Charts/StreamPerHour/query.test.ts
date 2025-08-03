import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/StreamPerHour/fixtures/seed.json'
let conn: DuckDBConnection

beforeAll(async () => {
    conn = await DuckDBConnection.create()
})

afterAll(() => {
    conn.closeSync()
})

beforeEach(async () => {
    await conn.run(`CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${seedPath}')`)
})

describe('SummaryPerYear query', () => {
    describe('query with year', () => {
        it('counts the streams of the year per hour', async () => {
            const result = await conn.runAndReadAll(queryByYear(2006))
            const rows = result.getRowObjects()
            expect(rows).toEqual([
                { hour: 0, count_stream: 0 },
                { hour: 1, count_stream: 0 },
                { hour: 2, count_stream: 0 },
                { hour: 3, count_stream: 0 },
                { hour: 4, count_stream: 2 },
                { hour: 5, count_stream: 0 },
                { hour: 6, count_stream: 2 },
                { hour: 7, count_stream: 0 },
                { hour: 8, count_stream: 0 },
                { hour: 9, count_stream: 0 },
                { hour: 10, count_stream: 1 },
                { hour: 11, count_stream: 0 },
                { hour: 12, count_stream: 0 },
                { hour: 13, count_stream: 0 },
                { hour: 14, count_stream: 0 },
                { hour: 15, count_stream: 0 },
                { hour: 16, count_stream: 0 },
                { hour: 17, count_stream: 0 },
                { hour: 18, count_stream: 0 },
                { hour: 19, count_stream: 0 },
                { hour: 20, count_stream: 0 },
                { hour: 21, count_stream: 0 },
                { hour: 22, count_stream: 1 },
                { hour: 23, count_stream: 0 },
            ])
        })

        it('counts 0 if there is no stream', async () => {
            const result = await conn.runAndReadAll(queryByYear(2025))
            const rows = result.getRowObjects()
            expect(rows).toEqual([
                { hour: 0, count_stream: 0 },
                { hour: 1, count_stream: 0 },
                { hour: 2, count_stream: 0 },
                { hour: 3, count_stream: 0 },
                { hour: 4, count_stream: 0 },
                { hour: 5, count_stream: 0 },
                { hour: 6, count_stream: 0 },
                { hour: 7, count_stream: 0 },
                { hour: 8, count_stream: 0 },
                { hour: 9, count_stream: 0 },
                { hour: 10, count_stream: 0 },
                { hour: 11, count_stream: 0 },
                { hour: 12, count_stream: 0 },
                { hour: 13, count_stream: 0 },
                { hour: 14, count_stream: 0 },
                { hour: 15, count_stream: 0 },
                { hour: 16, count_stream: 0 },
                { hour: 17, count_stream: 0 },
                { hour: 18, count_stream: 0 },
                { hour: 19, count_stream: 0 },
                { hour: 20, count_stream: 0 },
                { hour: 21, count_stream: 0 },
                { hour: 22, count_stream: 0 },
                { hour: 23, count_stream: 0 },
            ])
        })
    })

    describe('query without year', () => {
        it('counts the streams of all years per hour', async () => {
            const result = await conn.runAndReadAll(queryByYear(undefined))
            const rows = result.getRowObjects()
            expect(rows).toEqual([
                { hour: 0, count_stream: 0 },
                { hour: 1, count_stream: 0 },
                { hour: 2, count_stream: 0 },
                { hour: 3, count_stream: 0 },
                { hour: 4, count_stream: 2 },
                { hour: 5, count_stream: 0 },
                { hour: 6, count_stream: 2 },
                { hour: 7, count_stream: 0 },
                { hour: 8, count_stream: 0 },
                { hour: 9, count_stream: 0 },
                { hour: 10, count_stream: 1 },
                { hour: 11, count_stream: 0 },
                { hour: 12, count_stream: 0 },
                { hour: 13, count_stream: 0 },
                { hour: 14, count_stream: 0 },
                { hour: 15, count_stream: 0 },
                { hour: 16, count_stream: 0 },
                { hour: 17, count_stream: 0 },
                { hour: 18, count_stream: 0 },
                { hour: 19, count_stream: 0 },
                { hour: 20, count_stream: 0 },
                { hour: 21, count_stream: 0 },
                { hour: 22, count_stream: 1 },
                { hour: 23, count_stream: 0 },
            ])
        })
    })
})
