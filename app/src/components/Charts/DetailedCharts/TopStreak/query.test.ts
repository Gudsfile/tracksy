import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryTopStreak, queryCurrentStreak } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/DetailedCharts/TopStreak/fixtures/seed.json'
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

describe('TopStreak query', () => {
    it('queryTopStreak returns the longest streak', async () => {
        const result = await conn.runAndReadAll(queryTopStreak())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.streaks).toBe(5)
        expect(row.start_ts).toBe('2025-01-01')
        expect(row.end_ts).toBe('2025-01-05')
    })

    it('queryCurrentStreak returns the most recent streak', async () => {
        const result = await conn.runAndReadAll(queryCurrentStreak())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        const row = rows[0]
        expect(row.streaks).toBe(3)
        expect(row.start_ts).toBe('2025-10-17')
        expect(row.end_ts).toBe('2025-10-19')
    })

    it('treats a gap in dates as a streak break', async () => {
        // Verify the DATE - INTEGER grouping correctly isolates non-consecutive days.
        // The seed has a 5-day streak (Jan 1–5) and a 3-day streak (Oct 17–19)
        // with a multi-month gap between them. queryTopStreak must NOT merge them.
        const result = await conn.runAndReadAll(queryTopStreak())
        const rows = result.getRowObjectsJson()
        const top = rows[0]
        // The top streak is the 5-day Jan block, not a merged 8-day block
        expect(top.streaks).toBe(5)
        expect(top.end_ts).toBe('2025-01-05')
    })

    it('returns streak of 1 when only a single date exists', async () => {
        await conn.run(
            `CREATE OR REPLACE TABLE ${TABLE} AS
             SELECT '2025-06-15T12:00:00Z'::timestamp AS ts`
        )
        const result = await conn.runAndReadAll(queryTopStreak())
        const rows = result.getRowObjectsJson()
        expect(rows.length).toBe(1)
        expect(rows[0].streaks).toBe(1)
        expect(rows[0].start_ts).toBe('2025-06-15')
        expect(rows[0].end_ts).toBe('2025-06-15')
    })
})
