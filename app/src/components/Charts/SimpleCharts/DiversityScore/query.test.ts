import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryDiversityScore } from './query'
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
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist3' },
]

describe('DiversityScore Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return diversity metrics', async () => {
        const rows = await testQuery(conn, queryDiversityScore())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.unique_artists).toBe(3)
        expect(row.total_streams).toBe(5)
        expect(row.avg_streams_per_artist).toBe(5 / 3)
    })
})
