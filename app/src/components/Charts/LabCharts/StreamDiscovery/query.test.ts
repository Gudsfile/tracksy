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
import { queryStreamDiscovery, queryStreamDiscoveryStats } from './query'
import { TABLE } from '../../../../db/queries/constants'

const seedPath =
    'src/components/Charts/LabCharts/StreamDiscovery/fixtures/seed.json'
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

// Seed:
// 2005-03-10: track_A / artist_X / album_1  (pre-2006, so "known" in 2006)
// 2006-01-15: track_A / artist_X / album_1  (known — first heard 2005)
// 2006-01-20: track_B / artist_Y / album_2  (new — first heard Jan 2006)
// 2006-04-05: track_C / artist_Z / album_3  (new — first heard Apr 2006)
// 2006-06-01: track_B / artist_Y / album_2  (known — first heard Jan 2006)

describe('StreamDiscovery query — month granularity, tracks entity', () => {
    it('distinguishes new tracks from known tracks per month', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(2006, 'month', 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows).toHaveLength(12)

        // Jan: track_A (known, first=2005) + track_B (new, first=Jan 2006)
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.new_count).toBe(1)
        expect(jan?.known_count).toBe(1)
        expect(jan?.total_count).toBe(2)

        // Apr: track_C (new)
        const apr = rows.find((r) => r.ts === '2006-04-01')
        expect(apr?.new_count).toBe(1)
        expect(apr?.known_count).toBe(0)
        expect(apr?.total_count).toBe(1)

        // Jun: track_B (known — first heard Jan 2006, not Jun)
        const jun = rows.find((r) => r.ts === '2006-06-01')
        expect(jun?.new_count).toBe(0)
        expect(jun?.known_count).toBe(1)
        expect(jun?.total_count).toBe(1)

        // Feb: gap-filled
        const feb = rows.find((r) => r.ts === '2006-02-01')
        expect(feb?.new_count).toBe(0)
        expect(feb?.known_count).toBe(0)
        expect(feb?.total_count).toBe(0)
    })

    it('includes pre-period data in all-time view', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(undefined, 'month', 'tracks')
            )
        ).getRowObjectsJson()

        // Mar 2005: track_A heard for first time → new
        const mar2005 = rows.find((r) => r.ts === '2005-03-01')
        expect(mar2005?.new_count).toBe(1)
        expect(mar2005?.known_count).toBe(0)

        // Jan 2006: track_A known (first=2005), track_B new
        const jan2006 = rows.find((r) => r.ts === '2006-01-01')
        expect(jan2006?.new_count).toBe(1)
        expect(jan2006?.known_count).toBe(1)
    })
})

describe('StreamDiscovery query — artists entity', () => {
    it('counts distinct new/known artists per month', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(2006, 'month', 'artists')
            )
        ).getRowObjectsJson()

        // Jan: artist_X (known, first=2005) + artist_Y (new, first=Jan 2006)
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.new_count).toBe(1)
        expect(jan?.known_count).toBe(1)

        // Apr: artist_Z (new)
        const apr = rows.find((r) => r.ts === '2006-04-01')
        expect(apr?.new_count).toBe(1)
        expect(apr?.known_count).toBe(0)
    })
})

describe('StreamDiscovery query — albums entity', () => {
    it('counts distinct new/known albums per month', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(2006, 'month', 'albums')
            )
        ).getRowObjectsJson()

        // Jan: album_1 (known, first=2005) + album_2 (new, first=Jan 2006)
        const jan = rows.find((r) => r.ts === '2006-01-01')
        expect(jan?.new_count).toBe(1)
        expect(jan?.known_count).toBe(1)
    })
})

describe('StreamDiscovery query — week granularity', () => {
    it('returns ISO Monday-first weeks covering full year', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(2006, 'week', 'tracks')
            )
        ).getRowObjectsJson()

        for (const row of rows) {
            const date = new Date(`${row.ts}T00:00:00Z`)
            expect(date.getUTCDay()).toBe(1)
        }

        expect(rows[0].ts).toBe('2005-12-26')
        expect(rows[rows.length - 1].ts).toBe('2006-12-25')

        // Jan 15 (Sun) → week of Jan 9: track_A (known, first=2005)
        const weekJan9 = rows.find((r) => r.ts === '2006-01-09')
        expect(weekJan9?.new_count).toBe(0)
        expect(weekJan9?.known_count).toBe(1)

        // Jan 20 (Fri) → week of Jan 16: track_B (new, first=2006-01-20)
        const weekJan16 = rows.find((r) => r.ts === '2006-01-16')
        expect(weekJan16?.new_count).toBe(1)
        expect(weekJan16?.known_count).toBe(0)
    })
})

describe('StreamDiscovery query — day granularity', () => {
    it('returns 365 gap-filled days for 2006', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(2006, 'day', 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows).toHaveLength(365)

        // Jan 15: track_A (known, first=2005-03-10)
        const jan15 = rows.find((r) => r.ts === '2006-01-15')
        expect(jan15?.new_count).toBe(0)
        expect(jan15?.known_count).toBe(1)

        // Jan 20: track_B (new, first=2006-01-20)
        const jan20 = rows.find((r) => r.ts === '2006-01-20')
        expect(jan20?.new_count).toBe(1)
        expect(jan20?.known_count).toBe(0)

        // Jan 18: gap-filled
        const jan18 = rows.find((r) => r.ts === '2006-01-18')
        expect(jan18?.new_count).toBe(0)
        expect(jan18?.total_count).toBe(0)
    })
})

describe('StreamDiscovery query — year granularity', () => {
    it('returns one row per year all-time', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscovery(undefined, 'year', 'tracks')
            )
        ).getRowObjectsJson()

        expect(rows).toHaveLength(2)

        // 2005: track_A first heard → new=1, known=0
        const row2005 = rows.find((r) => r.ts === '2005-01-01')
        expect(row2005?.new_count).toBe(1)
        expect(row2005?.known_count).toBe(0)

        // 2006: track_A (known from 2005), track_B and track_C new in 2006
        const row2006 = rows.find((r) => r.ts === '2006-01-01')
        expect(row2006?.new_count).toBe(2)
        expect(row2006?.known_count).toBe(1)
        expect(row2006?.total_count).toBe(3)
    })
})

describe('StreamDiscoveryStats query', () => {
    it('returns global new/known/distinct counts for a year', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamDiscoveryStats(2006, 'tracks'))
        ).getRowObjectsJson()

        expect(rows).toHaveLength(1)
        // Distinct in 2006: A, B, C = 3
        // New in 2006 (first_date in 2006): B, C = 2
        // Known: A = 1
        expect(rows[0].total_distinct).toBe(3)
        expect(rows[0].total_new).toBe(2)
        expect(rows[0].total_known).toBe(1)
    })

    it('returns all entities as new for all-time query', async () => {
        const rows = (
            await conn.runAndReadAll(
                queryStreamDiscoveryStats(undefined, 'tracks')
            )
        ).getRowObjectsJson()

        // All-time: new_condition=true → all distinct entities are "new"
        expect(rows[0].total_distinct).toBe(3)
        expect(rows[0].total_new).toBe(3)
        expect(rows[0].total_known).toBe(0)
    })

    it('counts distinct artists', async () => {
        const rows = (
            await conn.runAndReadAll(queryStreamDiscoveryStats(2006, 'artists'))
        ).getRowObjectsJson()

        // In 2006: artist_X (known, first=2005), artist_Y (new, first=Jan 2006), artist_Z (new, first=Apr 2006)
        expect(rows[0].total_distinct).toBe(3)
        expect(rows[0].total_new).toBe(2)
        expect(rows[0].total_known).toBe(1)
    })
})
