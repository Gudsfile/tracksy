import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTopAlbums } from './query'
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
    master_metadata_track_name: 'track1',
    master_metadata_album_artist_name: 'artist1',
    master_metadata_album_album_name: 'album1',
    ms_played: 1,
    ...overrides,
})

const testData: TestStreamEntry[] = [
    ...Array.from({ length: 10 }, () =>
        createStream({ master_metadata_album_album_name: 'album2' })
    ),
    ...Array.from({ length: 8 }, () =>
        createStream({
            master_metadata_album_album_name: 'album3',
            master_metadata_album_artist_name: 'artist3',
        })
    ),
    ...Array.from({ length: 6 }, () =>
        createStream({ master_metadata_album_album_name: 'album4' })
    ),
    // Should be first in the top 5 albums
    ...Array.from({ length: 6 }, () =>
        createStream({ master_metadata_album_album_name: 'album1' })
    ),
    ...Array.from({ length: 6 }, () =>
        createStream({
            master_metadata_album_album_name: 'album1',
            master_metadata_track_name: 'track2',
        })
    ),
    ...Array.from({ length: 4 }, () =>
        createStream({ master_metadata_album_album_name: 'album5' })
    ),
    // Should not be aggregated with the album5 of the artist1
    ...Array.from({ length: 1 }, () =>
        createStream({
            master_metadata_album_album_name: 'album5',
            master_metadata_album_artist_name: 'artist5',
        })
    ),
    // Should be ignored because it is out of the top 5 albums
    ...Array.from({ length: 2 }, () =>
        createStream({ master_metadata_album_album_name: 'album6' })
    ),
    // Should be ignored because of another year
    ...Array.from({ length: 5 }, () =>
        createStream({
            master_metadata_album_album_name: 'album7',
            ts: anotherDate,
        })
    ),
    // Should be ignored because album field is null
    ...Array.from({ length: 100 }, () =>
        createStream({ master_metadata_album_album_name: null })
    ),
    // Should be ignored because artist field is null
    ...Array.from({ length: 100 }, () =>
        createStream({ master_metadata_album_artist_name: null })
    ),
]

describe('TopAlbums Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return top albums ordered by stream count desc', async () => {
        const rows = await testQuery(conn, queryTopAlbums(testYear))
        expect(rows).toHaveLength(5)
        expect(rows).toEqual([
            {
                album_name: 'album1',
                artist_name: 'artist1',
                count_streams: 12,
                ms_played: 12,
            },
            {
                album_name: 'album2',
                artist_name: 'artist1',
                count_streams: 10,
                ms_played: 10,
            },
            {
                album_name: 'album3',
                artist_name: 'artist3',
                count_streams: 8,
                ms_played: 8,
            },
            {
                album_name: 'album4',
                artist_name: 'artist1',
                count_streams: 6,
                ms_played: 6,
            },
            {
                album_name: 'album5',
                artist_name: 'artist1',
                count_streams: 4,
                ms_played: 4,
            },
        ])
    })
})
