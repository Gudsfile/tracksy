import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { type ArtistLoyaltyResult, queryArtistLoyalty } from './query'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

const testData: TestStreamEntry[] = [
    // Artist with 1 stream (bin '1')
    { ts: '2025-01-01', artist_name: 'one_stream_artist' },
    // Artists with 2-10 streams (bin '2-10')
    { ts: '2025-01-01', artist_name: 'few_streams_artist' },
    { ts: '2025-01-02', artist_name: 'few_streams_artist' },
    { ts: '2025-01-03', artist_name: 'few_streams_artist' },
    // Artist with 11-100 streams (bin '11-100')
    ...Array.from({ length: 15 }, (_, i) => ({
        ts: `2025-01-${String(i + 1).padStart(2, '0')}`,
        artist_name: 'medium_streams_artist',
    })),
    // Artist with 101-1000 streams (bin '101-1000')
    ...Array.from({ length: 150 }, (_, i) => ({
        ts: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
        artist_name: 'many_streams_artist',
    })),
    // Artist with 1000+ streams (bin '1000+')
    ...Array.from({ length: 1200 }, (_, i) => ({
        ts: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
        artist_name: 'loyal_artist',
    })),
    // Other year should not be counted
    { ts: '2024-01-01', artist_name: 'other_year_artist' },
]

describe('ArtistLoyalty Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return artist bins for 2025', async () => {
        const rows = (await testQuery(
            conn,
            queryArtistLoyalty(2025)
        )) as unknown as ArtistLoyaltyResult[]

        expect(rows.length).toBe(5)

        const bins: Record<string, ArtistLoyaltyResult> = rows.reduce(
            (acc, row: ArtistLoyaltyResult) => {
                acc[row.stream_bin] = row
                return acc
            },
            {} as Record<string, ArtistLoyaltyResult>
        )

        expect(bins['1'].artist_count).toBe(1)
        expect(bins['2-10'].artist_count).toBe(1)
        expect(bins['11-100'].artist_count).toBe(1)
        expect(bins['101-1000'].artist_count).toBe(1)
        expect(bins['1000+'].artist_count).toBe(1)
    })

    it('should calculate correct stream counts per bin', async () => {
        const rows = (await testQuery(
            conn,
            queryArtistLoyalty(2025)
        )) as unknown as ArtistLoyaltyResult[]

        const bins = rows.reduce(
            (acc, row) => {
                acc[row.stream_bin] = row
                return acc
            },
            {} as Record<string, (typeof rows)[0]>
        )

        expect(bins['1'].streams_in_bin).toBe(1)
        expect(bins['2-10'].streams_in_bin).toBe(3)
        expect(bins['11-100'].streams_in_bin).toBe(15)
        expect(bins['101-1000'].streams_in_bin).toBe(150)
        expect(bins['1000+'].streams_in_bin).toBe(1200)
    })

    it('should return correct share of total streams', async () => {
        const rows = (await testQuery(
            conn,
            queryArtistLoyalty(2025)
        )) as unknown as ArtistLoyaltyResult[]

        const totalStreams = rows.reduce(
            (sum, row) => sum + (row.streams_in_bin ?? 0),
            0
        )

        expect(totalStreams).toBe(1369)

        const sharesSum = rows.reduce(
            (sum, row) => sum + (row.share_of_total_streams ?? 0),
            0
        )
        expect(sharesSum).toBeCloseTo(1, 3)
    })

    it('should filter by year correctly', async () => {
        const rows2025 = (await testQuery(
            conn,
            queryArtistLoyalty(2025)
        )) as unknown as ArtistLoyaltyResult[]
        const rows2024 = (await testQuery(
            conn,
            queryArtistLoyalty(2024)
        )) as unknown as ArtistLoyaltyResult[]

        expect(rows2025.length).toBe(5)
        expect(rows2024.length).toBe(1)
        expect(rows2024[0].stream_bin).toBe('1')
        expect(rows2024[0].artist_count).toBe(1)
    })

    it('should include all years when year is undefined', async () => {
        const rows = (await testQuery(
            conn,
            queryArtistLoyalty(undefined)
        )) as unknown as ArtistLoyaltyResult[]

        expect(rows.length).toBe(5)
        expect(rows[0].artist_count).toBe(2)
    })
})
