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
            { day_of_week: 0, play_hour: 4, count_streams: 1 },
            { day_of_week: 1, play_hour: 4, count_streams: 2 },
            { day_of_week: 1, play_hour: 10, count_streams: 1 },
            { day_of_week: 2, play_hour: 6, count_streams: 1 },
            { day_of_week: 3, play_hour: 4, count_streams: 1 },
            { day_of_week: 5, play_hour: 4, count_streams: 2 },
            { day_of_week: 5, play_hour: 10, count_streams: 1 },
            { day_of_week: 6, play_hour: 6, count_streams: 1 },
        ])
    })

    it('returns sum of streams per day of week and hour for a specific year', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(2006)
        )
        const rows = result.getRowObjects()
        expect(rows).toEqual([
            { day_of_week: 0, play_hour: 4, count_streams: 1 },
            { day_of_week: 5, play_hour: 4, count_streams: 2 },
            { day_of_week: 5, play_hour: 10, count_streams: 1 },
            { day_of_week: 6, play_hour: 6, count_streams: 1 },
        ])
    })
})
