import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { streamPerDayOfWeekQueryByYear } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/DetailedCharts/StreamPerDayOfWeek/fixtures/seed.json'
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

describe('StreamPerDayOfWeek query', () => {
    it('returns sum of streams per day of week and hour', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { dayOfWeek: 0, hour: 4, count_streams: 1 },
            { dayOfWeek: 1, hour: 4, count_streams: 2 },
            { dayOfWeek: 1, hour: 10, count_streams: 1 },
            { dayOfWeek: 2, hour: 6, count_streams: 1 },
            { dayOfWeek: 3, hour: 4, count_streams: 1 },
            { dayOfWeek: 5, hour: 4, count_streams: 2 },
            { dayOfWeek: 5, hour: 10, count_streams: 1 },
            { dayOfWeek: 6, hour: 6, count_streams: 1 },
        ])
    })

    it('returns sum of streams per day of week and hour for a specific year', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(2006)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { dayOfWeek: 0, hour: 4, count_streams: 1 },
            { dayOfWeek: 5, hour: 4, count_streams: 2 },
            { dayOfWeek: 5, hour: 10, count_streams: 1 },
            { dayOfWeek: 6, hour: 6, count_streams: 1 },
        ])
    })
})
