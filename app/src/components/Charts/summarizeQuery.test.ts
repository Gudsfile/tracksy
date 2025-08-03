import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { query } from './summarizeQuery'
import { TABLE } from '../../db/queries/constants'

const seedPath = 'src/components/Charts/fixtures/seed.json'
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

describe('Charts summarizeQuery', () => {
    it('summarizes the streams', async () => {
        const result = await conn.runAndReadAll(query)
        const rows = result.getRowObjectsJS()
        expect(rows).toEqual([
            {
                min_datetime: new Date('2006-01-17T04:41:23.000Z'),
                max_datetime: new Date('2006-12-09T06:46:46.000Z'),
                max_count_hourly_stream: 2n,
            },
        ])
    })
})
