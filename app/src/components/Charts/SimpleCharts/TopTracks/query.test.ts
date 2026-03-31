import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryTopTracks } from './query'
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
    ...Array.from({ length: 10 }, () => createStream({ track_name: 'track2' })),
    ...Array.from({ length: 8 }, () => createStream({ track_name: 'track3' })),
    ...Array.from({ length: 6 }, () => createStream({ track_name: 'track4' })),
    // Should be first in the top 5 tracks
    ...Array.from({ length: 12 }, () => createStream({ track_name: 'track1' })),
    ...Array.from({ length: 4 }, () => createStream({ track_name: 'track5' })),
    // Should be ignored because it is out of the top 5 tracks
    ...Array.from({ length: 2 }, () => createStream({ track_name: 'track6' })),
    // Should be ignored because of another year
    ...Array.from({ length: 10 }, () =>
        createStream({ track_name: 'track4', ts: anotherDate })
    ),
    // Should be ignored because track field is null
    ...Array.from({ length: 100 }, () => createStream({ track_name: null })),
    // Should be ignored because artist field is null
    ...Array.from({ length: 100 }, () => createStream({ artist_name: null })),
]

describe('TopTracks Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return top tracks ordered by stream count desc', async () => {
        const rows = await testQuery(conn, queryTopTracks(testYear))
        expect(rows).toHaveLength(5)
        expect(rows).toEqual([
            {
                track_name: 'track1',
                artist_name: 'artist1',
                count_streams: 12,
                ms_played: 12,
            },
            {
                track_name: 'track2',
                artist_name: 'artist1',
                count_streams: 10,
                ms_played: 10,
            },
            {
                track_name: 'track3',
                artist_name: 'artist1',
                count_streams: 8,
                ms_played: 8,
            },
            {
                track_name: 'track4',
                artist_name: 'artist1',
                count_streams: 6,
                ms_played: 6,
            },
            {
                track_name: 'track5',
                artist_name: 'artist1',
                count_streams: 4,
                ms_played: 4,
            },
        ])
    })

    it('should include all years when year is undefined', async () => {
        const rows = await testQuery(conn, queryTopTracks(undefined))
        // track4 has 6 in testYear + 10 in anotherDate = 16 total, ranking it first
        expect(rows).toHaveLength(5)
        expect(rows[0]).toMatchObject({
            track_name: 'track4',
            count_streams: 16,
        })
    })
})
