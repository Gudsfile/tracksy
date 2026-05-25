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
import { queryStreamVariety, queryStreamVarietyStats } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/LabCharts/StreamVariety/fixtures/seed.json'
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

describe('StreamVariety query — month granularity, tracks entity', () => {
    it('returns distinct/repeat counts per month for a specific year', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVariety(2006, 'month', 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows).toHaveLength(12)

        // Jan: track_A x2, track_B x1 → distinct=2, repeat=1, total=3
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.distinct_count).toBe(2)
        expect(jan?.repeat_count).toBe(1)
        expect(jan?.total_count).toBe(3)

        // Apr: track_C x1 → distinct=1, repeat=0, total=1
        const apr = rows.find((r) => r.ts === '2006-04-01')
        expect(apr?.distinct_count).toBe(1)
        expect(apr?.repeat_count).toBe(0)
        expect(apr?.total_count).toBe(1)

        // Feb: gap-filled
        const feb = rows.find((r) => r.ts === '2006-02-01')
        expect(feb?.distinct_count).toBe(0)
        expect(feb?.repeat_count).toBe(0)
        expect(feb?.total_count).toBe(0)
    })

    it('returns all-time data across years without year filter', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVariety(undefined, 'month', 'tracks')
            )
        ).getRowObjectsJson()

        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.distinct_count).toBe(2)
        expect(jan?.total_count).toBe(3)
    })
})

describe('StreamVariety query — artists entity', () => {
    it('counts distinct artists, not tracks', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVariety(2006, 'month', 'artists')
            )
        ).getRowObjectsJson()

        // Jan: all 3 streams are artist_X → distinct=1, repeat=2, total=3
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.distinct_count).toBe(1)
        expect(jan?.repeat_count).toBe(2)
        expect(jan?.total_count).toBe(3)
    })
})

describe('StreamVariety query — albums entity', () => {
    it('counts distinct albums', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVariety(2006, 'month', 'albums')
            )
        ).getRowObjectsJson()

        // Jan: all 3 streams are album_1 → distinct=1, repeat=2, total=3
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.distinct_count).toBe(1)
        expect(jan?.repeat_count).toBe(2)
        expect(jan?.total_count).toBe(3)
    })
})

describe('StreamVariety query — week granularity', () => {
    it('returns ISO Monday-first weeks covering full year', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamVariety(2006, 'week', 'tracks'))
        ).getRowObjectsJson()

        for (const row of rows) {
            const date = new Date(`${row.ts}T00:00:00Z`)
            expect(date.getUTCDay()).toBe(1)
        }

        expect(rows[0].ts).toBe('2005-12-26')
        expect(rows[rows.length - 1].ts).toBe('2006-12-25')
    })
})

describe('StreamVariety query — day granularity', () => {
    it('returns 365 gap-filled days for 2006', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamVariety(2006, 'day', 'tracks'))
        ).getRowObjectsJson()

        expect(rows).toHaveLength(365)

        const jan17 = rows.find((r) => r.ts === '2006-01-17')
        expect(jan17?.distinct_count).toBe(1)
        expect(jan17?.total_count).toBe(1)

        const jan18 = rows.find((r) => r.ts === '2006-01-18')
        expect(jan18?.distinct_count).toBe(0)
        expect(jan18?.total_count).toBe(0)
    })
})

describe('StreamVarietyStats query', () => {
    it('returns global distinct/repeat/total counts independent of granularity', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamVarietyStats(2006, 'tracks'))
        ).getRowObjectsJson()

        expect(rows).toHaveLength(1)
        expect(rows[0].total_distinct).toBe(3)
        expect(rows[0].total_repeat).toBe(2)
        expect(rows[0].total_streams).toBe(5)
    })

    it('filters by year', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVarietyStats(undefined, 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows[0].total_streams).toBe(5)
    })

    it('counts distinct artists', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamVarietyStats(2006, 'artists'))
        ).getRowObjectsJson()

        expect(rows[0].total_distinct).toBe(2)
        expect(rows[0].total_repeat).toBe(3)
    })
})

describe('StreamVariety query — year granularity', () => {
    it('returns one row per year all-time', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamVariety(undefined, 'year', 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows).toHaveLength(1)
        const row2006 = rows.find((r) => r.ts === '2006-01-01')
        expect(row2006?.total_count).toBe(5)
        expect(row2006?.distinct_count).toBe(3)
        expect(row2006?.repeat_count).toBe(2)
    })
})
