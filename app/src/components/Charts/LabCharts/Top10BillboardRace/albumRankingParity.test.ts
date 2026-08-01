import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import type { DuckDBValue } from '@duckdb/node-api'
import { queryTop10BillboardRace } from './query'
import { queryTopAlbums } from '../../SimpleCharts/TopAlbums/query'
import {
    createTestConnection,
    closeTestConnection,
    createTestTable,
    testQuery,
    type TestStreamEntry,
} from '../../SimpleCharts/__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

// Regression test for #592: "Top Albums" (simple view) and "Top 10
// Billboard Race" (lab view, albums mode) must agree on album identity and
// ranking. Album identity is (album_name, artist_name) — two albums that
// share a name but belong to different artists are distinct entities in
// both charts.

let conn: DuckDBConnection

const testYear = 2025
const testDate = `${testYear}-01-01`

const createStream = (overrides: Partial<TestStreamEntry> = {}) => ({
    ts: testDate,
    track_name: 'track1',
    artist_name: 'artist1',
    album_name: 'album1',
    ms_played: 1,
    ...overrides,
})

const testData: TestStreamEntry[] = [
    ...Array.from({ length: 12 }, () => createStream({ album_name: 'album1' })),
    ...Array.from({ length: 10 }, () => createStream({ album_name: 'album2' })),
    ...Array.from({ length: 8 }, () =>
        createStream({ album_name: 'album3', artist_name: 'artist3' })
    ),
    ...Array.from({ length: 6 }, () => createStream({ album_name: 'album4' })),
    // Same album name as above, but a different artist: must stay a
    // distinct entity in both charts instead of being merged.
    ...Array.from({ length: 5 }, () => createStream({ album_name: 'album5' })),
    ...Array.from({ length: 4 }, () =>
        createStream({ album_name: 'album5', artist_name: 'artist5' })
    ),
]

describe('Top Albums vs Top 10 Billboard Race (albums) ranking parity', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('produce the same top-5 album ranking across the period', async () => {
        const simpleViewRows = await testQuery<{
            album_name: string
            artist_name: string
            count_streams: number
        }>(conn, queryTopAlbums(testYear))

        const simpleViewRanking = simpleViewRows.map(
            (row) => `${row.album_name} — ${row.artist_name}`
        )

        const raceRows = await conn.runAndReadAll(
            queryTop10BillboardRace(testYear, 'albums')
        )

        const totals = new Map<string, number>()
        for (const row of raceRows.getRowObjects() as Record<
            string,
            DuckDBValue
        >[]) {
            const entityName = row.entity_name as string
            const periodPlays = row.period_plays as number
            totals.set(entityName, (totals.get(entityName) ?? 0) + periodPlays)
        }

        const raceRanking = Array.from(totals.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([entityName]) => entityName)

        expect(raceRanking).toEqual(simpleViewRanking)
        // Sanity check: the duplicate album name across artists must not
        // have collapsed into a single race entity.
        expect(raceRanking).toContain('album5 — artist1')
        expect(totals.has('album5 — artist5')).toBe(true)
        expect(totals.get('album5 — artist1')).not.toBe(
            totals.get('album5 — artist5')
        )
    })
})
