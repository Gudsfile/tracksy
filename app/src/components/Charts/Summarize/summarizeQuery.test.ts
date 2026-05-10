import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { summarizeQuery } from './summarizeQuery'

let conn: DuckDBConnection

beforeAll(async () => {
    conn = await DuckDBConnection.create()
})

afterAll(() => {
    conn.closeSync()
})

beforeEach(async () => {
    await conn.run(`
        CREATE OR REPLACE TABLE summarize_cache AS
        SELECT
            2 AS max_count_hourly_stream,
            5.5 AS max_monthly_duration,
            '2006-01-17T04:41:23.000Z'::datetime AS min_datetime,
            '2006-12-09T06:46:46.000Z'::datetime AS max_datetime
    `)
})

describe('Charts summarizeQuery', () => {
    it('summarizes the streams', async () => {
        const result = await conn.runAndReadAll(summarizeQuery)
        const rows = result.getRowObjectsJS()
        expect(rows).toEqual([
            {
                min_datetime: new Date('2006-01-17T04:41:23.000Z'),
                max_datetime: new Date('2006-12-09T06:46:46.000Z'),
                max_count_hourly_stream: 2,
                max_monthly_duration: 5.5,
            },
        ])
    })
})
