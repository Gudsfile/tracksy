import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { streamPerDayOfWeekQueryByYear } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/LabCharts/StreamPerDayOfWeek/fixtures/seed.json'
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
    it('returns rows with the expected output fields', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()
        expect(rows.length).toBeGreaterThan(0)
        const first = rows[0]
        expect(first).toHaveProperty('stream_date_ts')
        expect(first).toHaveProperty('day_of_week')
        expect(first).toHaveProperty('play_hour')
        expect(first).toHaveProperty('cumulative_count')
    })

    it('orders rows chronologically by stream_date_ts', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()
        const timestamps = rows.map((r) => Number(r.stream_date_ts))
        for (let i = 1; i < timestamps.length; i++) {
            expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
        }
    })

    it('accumulates counts for the same (day_of_week, play_hour) cell across multiple dates', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()

        // Cell (0, 4): Sunday hour 4 appears on 2006-03-19, 2025-10-05, 2025-11-09
        const sunday4 = rows.filter(
            (r) => r.day_of_week === 0 && r.play_hour === 4
        )
        expect(sunday4).toHaveLength(3)
        expect(Number(sunday4[0].cumulative_count)).toBe(1)
        expect(Number(sunday4[1].cumulative_count)).toBe(2)
        expect(Number(sunday4[2].cumulative_count)).toBe(3)
    })

    it('accumulates daily_count > 1 correctly when multiple plays land on the same date', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()

        // Cell (1, 4): Monday hour 4 has plays on 2006-03-20 (1), 2025-10-06 (1), 2025-11-03 (2)
        // Cumulative: 1, 2, 4
        const monday4 = rows.filter(
            (r) => r.day_of_week === 1 && r.play_hour === 4
        )
        expect(monday4).toHaveLength(3)
        expect(Number(monday4[0].cumulative_count)).toBe(1)
        expect(Number(monday4[1].cumulative_count)).toBe(2)
        expect(Number(monday4[2].cumulative_count)).toBe(4)
    })

    it('covers all 24 hours for Monday across the full dataset', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()
        const mondayHours = new Set(
            rows.filter((r) => r.day_of_week === 1).map((r) => r.play_hour)
        )
        for (let h = 0; h < 24; h++) {
            expect(mondayHours.has(h)).toBe(true)
        }
    })

    it('hour 4 is present across all 7 days of the week', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(undefined)
        )
        const rows = result.getRowObjects()
        const daysWithHour4 = new Set(
            rows.filter((r) => r.play_hour === 4).map((r) => r.day_of_week)
        )
        for (let d = 0; d < 7; d++) {
            expect(daysWithHour4.has(d)).toBe(true)
        }
    })

    it('filters rows by year', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(2025)
        )
        const rows = result.getRowObjects()
        expect(rows.length).toBeGreaterThan(0)

        // 2006 rows excluded: cell (0,4) first date is now 2025-10-05, cumulative starts at 1
        const sunday4 = rows.filter(
            (r) => r.day_of_week === 0 && r.play_hour === 4
        )
        expect(sunday4).toHaveLength(2)
        expect(Number(sunday4[0].cumulative_count)).toBe(1)
        expect(Number(sunday4[1].cumulative_count)).toBe(2)

        // 2006 rows excluded: cell (1,4) starts at 2025-10-06, cumulative starts at 1
        const monday4 = rows.filter(
            (r) => r.day_of_week === 1 && r.play_hour === 4
        )
        expect(monday4).toHaveLength(2)
        expect(Number(monday4[0].cumulative_count)).toBe(1)
        expect(Number(monday4[1].cumulative_count)).toBe(3)
    })

    it('stream_date_ts is epoch milliseconds (numeric, not a date string)', async () => {
        const result = await conn.runAndReadAll(
            streamPerDayOfWeekQueryByYear(2025)
        )
        const rows = result.getRowObjects()
        const ts = Number(rows[0].stream_date_ts)
        // 2025-10-05 in epoch ms is roughly 1.75e12
        expect(ts).toBeGreaterThan(1_000_000_000_000)
    })
})
