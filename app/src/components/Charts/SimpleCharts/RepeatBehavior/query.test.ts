import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryRepeatBehavior } from './query'
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
    {
        ts: '2024-01-15T10:00:00Z',
        master_metadata_track_name: 'repeated_4_times_consecutively_track',
        spotify_track_uri: 'artist1:track1',
    },
    {
        ts: '2024-01-16T11:00:00Z',
        master_metadata_track_name: 'repeated_4_times_consecutively_track',
        spotify_track_uri: 'artist1:track1',
    },
    {
        ts: '2024-01-17T12:00:00Z',
        master_metadata_track_name: 'repeated_4_times_consecutively_track',
        spotify_track_uri: 'artist1:track1',
    },
    {
        ts: '2024-01-18T13:00:00Z',
        master_metadata_track_name: 'repeated_4_times_consecutively_track',
        spotify_track_uri: 'artist1:track1',
    },
    {
        ts: '2024-01-10T10:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist2:track1',
    },
    {
        ts: '2024-01-11T11:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist2:track1',
    },
    {
        ts: '2024-01-12T12:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist2:track1',
    },
    {
        ts: '2024-07-03T19:00:00Z',
        master_metadata_track_name: 'repeated_2_times_consecutively_track',
        spotify_track_uri: 'artist3:track1',
    },
    {
        ts: '2024-07-03T19:05:00Z',
        master_metadata_track_name: 'repeated_2_times_consecutively_track',
        spotify_track_uri: 'artist3:track1',
    },
    {
        ts: '2024-01-28T10:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist4:track1',
    },
    {
        ts: '2024-01-29T11:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist4:track1',
    },
    {
        ts: '2024-01-30T12:00:00Z',
        master_metadata_track_name: 'repeated_3_times_consecutively_track',
        spotify_track_uri: 'artist4:track1',
    },
    {
        ts: '2024-01-23T10:00:00Z',
        master_metadata_track_name: 'non_repeating_track',
        spotify_track_uri: 'artist5:track1',
    },
    {
        ts: '2018-01-24T10:00:00Z',
        master_metadata_track_name: 'unselected_year_track',
        spotify_track_uri: 'artist6:track1',
    },
    {
        ts: '2018-01-24T10:00:00Z',
        master_metadata_track_name: 'unselected_year_track',
        spotify_track_uri: 'artist6:track1',
    },
]

describe('RepeatBehavior Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return repeat behavior metrics', async () => {
        const rows = await testQuery(conn, queryRepeatBehavior(2024))

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.total_repeat_sequences).toBe(4)
        expect(row.max_consecutive).toBe(4)
        expect(row.avg_repeat_length).toBe(3)
        expect(row.most_repeated_track).toBe(
            'repeated_4_times_consecutively_track'
        )
    })
})
