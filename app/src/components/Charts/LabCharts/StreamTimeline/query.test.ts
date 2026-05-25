import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    it,
    expect,
    vi,
} from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryStreamTimeline } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/LabCharts/StreamTimeline/fixtures/seed.json'
let conn: DuckDBConnection

beforeAll(async () => {
    conn = await DuckDBConnection.create()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15'))
})

afterAll(() => {
    conn.closeSync()
    vi.useRealTimers()
})

beforeEach(async () => {
    await conn.run(`CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${seedPath}')`)
})

function generateExpectedMonths(
    start: string,
    end: string,
    overrides: Record<string, { ms_played: number; count_streams: number }> = {}
) {
    const startDate = new Date(`${start}T00:00:00Z`)
    const endDate = new Date(`${end}T00:00:00Z`)
    const result: { ts: string; ms_played: number; count_streams: number }[] =
        []

    const currentDate = new Date(startDate.getTime())
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().slice(0, 10)
        result.push({
            ts: dateString,
            ms_played: overrides[dateString]?.ms_played || 0.0,
            count_streams: overrides[dateString]?.count_streams || 0,
        })
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
    }
    return result
}

describe('StreamTimeline query — month granularity', () => {
    it('returns listening times by month for all years', async () => {
        const result = await conn.runAndReadAll(
            queryStreamTimeline(undefined, 'month')
        )
        const rows = result.getRowObjectsJson()

        const expected = generateExpectedMonths('2006-01-01', '2025-12-01', {
            '2006-01-01': { ms_played: 3.3, count_streams: 1 },
            '2006-04-01': { ms_played: 2.2, count_streams: 1 },
            '2006-06-01': { ms_played: 1.1, count_streams: 1 },
            '2006-10-01': { ms_played: 2.2, count_streams: 2 },
            '2006-12-01': { ms_played: 1.1, count_streams: 1 },
            '2025-12-01': { ms_played: 1.1, count_streams: 1 },
        })

        expect(rows).toEqual(expected)
    })

    it('returns listening times by month for a specific year', async () => {
        const result = await conn.runAndReadAll(
            queryStreamTimeline(2006, 'month')
        )
        const rows = result.getRowObjectsJson()

        expect(rows).toEqual([
            { ts: '2006-01-01', ms_played: 3.3, count_streams: 1 },
            { ts: '2006-02-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-03-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-04-01', ms_played: 2.2, count_streams: 1 },
            { ts: '2006-05-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-06-01', ms_played: 1.1, count_streams: 1 },
            { ts: '2006-07-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-08-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-09-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-10-01', ms_played: 2.2, count_streams: 2 },
            { ts: '2006-11-01', ms_played: 0.0, count_streams: 0 },
            { ts: '2006-12-01', ms_played: 1.1, count_streams: 1 },
        ])
    })
})

describe('StreamTimeline query — year granularity', () => {
    it('returns two rows for all-time with gap-filled zero years omitted (spine covers range)', async () => {
        const result = await conn.runAndReadAll(
            queryStreamTimeline(undefined, 'year')
        )
        const rows = result.getRowObjectsJson()

        // spine from 2006 to 2025 = 20 rows
        expect(rows).toHaveLength(20)

        const row2006 = rows.find((r) => r.ts === '2006-01-01')
        expect(row2006?.ms_played).toBeCloseTo(9.9)
        expect(row2006?.count_streams).toBe(6)

        const row2025 = rows.find((r) => r.ts === '2025-01-01')
        expect(row2025?.ms_played).toBeCloseTo(1.1)
        expect(row2025?.count_streams).toBe(1)

        // gap year has 0
        const row2010 = rows.find((r) => r.ts === '2010-01-01')
        expect(row2010?.ms_played).toBe(0)
        expect(row2010?.count_streams).toBe(0)
    })
})

describe('StreamTimeline query — week granularity', () => {
    it('returns gap-filled weeks for a specific year covering full year', async () => {
        const result = await conn.runAndReadAll(
            queryStreamTimeline(2006, 'week')
        )
        const rows = result.getRowObjectsJson()

        // all ts are Mondays (ISO week start)
        for (const row of rows) {
            const date = new Date(`${row.ts}T00:00:00Z`)
            expect(date.getUTCDay()).toBe(1)
        }

        // spine starts on or before Jan 1 2006 (first week covering the year)
        // 2006-01-01 is Sunday → date_trunc('week') = 2005-12-26
        expect(rows[0].ts).toBe('2005-12-26')

        // spine ends on or after Dec 25 2006 (last Monday in the year)
        expect(rows[rows.length - 1].ts).toBe('2006-12-25')

        // known data: 2006-01-17 (Tue) → week 2006-01-16
        const jan16 = rows.find((r) => r.ts === '2006-01-16')
        expect(jan16?.ms_played).toBeCloseTo(3.3)
        expect(jan16?.count_streams).toBe(1)

        // gap week has 0
        const gap = rows.find((r) => r.ts === '2006-02-06')
        expect(gap?.ms_played).toBe(0)
        expect(gap?.count_streams).toBe(0)
    })
})

describe('StreamTimeline query — full-year spine regression', () => {
    it('per-year spine covers Jan–Dec even when data starts mid-year', async () => {
        await conn.run(
            `INSERT INTO ${TABLE} VALUES ('2020-06-15T12:00:00Z', 5.0)`
        )

        const rows = (
            await conn.runAndReadAll(queryStreamTimeline(2020, 'month'))
        ).getRowObjectsJson()

        expect(rows).toHaveLength(12)
        expect(rows.find((r) => r.ts === '2020-01-01')?.ms_played).toBe(0)
        expect(rows.find((r) => r.ts === '2020-06-01')?.ms_played).toBeCloseTo(
            5.0
        )
        expect(rows.find((r) => r.ts === '2020-12-01')?.ms_played).toBe(0)
    })
})

describe('StreamTimeline query — day granularity', () => {
    it('returns gap-filled days for a specific year', async () => {
        const result = await conn.runAndReadAll(
            queryStreamTimeline(2006, 'day')
        )
        const rows = result.getRowObjectsJson()

        // 2006 has 365 days
        expect(rows).toHaveLength(365)

        const jan17 = rows.find((r) => r.ts === '2006-01-17')
        expect(jan17?.ms_played).toBeCloseTo(3.3)
        expect(jan17?.count_streams).toBe(1)

        const jan18 = rows.find((r) => r.ts === '2006-01-18')
        expect(jan18?.ms_played).toBe(0)
        expect(jan18?.count_streams).toBe(0)
    })
})
