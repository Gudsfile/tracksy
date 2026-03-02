import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTopArtists } from './query'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

const testYear = 2025
const testDate = `${testYear}-01-01`
const anotherDate = `${testYear - 1}-01-01`

const createStream = (overrides = {}) => ({
    ts: testDate,
    track_name: 'track1',
    artist_name: 'artist1',
    ms_played: 1,
    ...overrides,
})

const testData: TestStreamEntry[] = [
    ...Array.from({ length: 10 }, () =>
        createStream({ artist_name: 'artist2' })
    ),
    ...Array.from({ length: 8 }, () =>
        createStream({ artist_name: 'artist3' })
    ),
    ...Array.from({ length: 6 }, () =>
        createStream({ artist_name: 'artist4' })
    ),
    // Should be first in the top 5 artists
    ...Array.from({ length: 6 }, () =>
        createStream({ artist_name: 'artist1' })
    ),
    ...Array.from({ length: 6 }, () =>
        createStream({
            artist_name: 'artist1',
            track_name: 'track2',
        })
    ),
    ...Array.from({ length: 4 }, () =>
        createStream({ artist_name: 'artist5' })
    ),
    // Should be ignored because it is out of the top 5 artists
    ...Array.from({ length: 2 }, () =>
        createStream({ artist_name: 'artist6' })
    ),
    // Should be ignored because of another year
    ...Array.from({ length: 5 }, () =>
        createStream({
            artist_name: 'artist7',
            ts: anotherDate,
        })
    ),
    // Should be ignored because artist field is null
    ...Array.from({ length: 100 }, () => createStream({ artist_name: null })),
]

describe('TopArtists Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return top artists ordered by stream count desc', async () => {
        const rows = await testQuery(conn, queryTopArtists(testYear))
        expect(rows).toHaveLength(5)
        expect(rows).toEqual([
            { artist_name: 'artist1', count_streams: 12, ms_played: 12 },
            { artist_name: 'artist2', count_streams: 10, ms_played: 10 },
            { artist_name: 'artist3', count_streams: 8, ms_played: 8 },
            { artist_name: 'artist4', count_streams: 6, ms_played: 6 },
            { artist_name: 'artist5', count_streams: 4, ms_played: 4 },
        ])
    })
})
