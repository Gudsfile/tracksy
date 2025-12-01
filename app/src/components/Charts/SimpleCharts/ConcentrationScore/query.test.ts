import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { queryConcentrationScore } from './query'
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
    // Top 5
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist1' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist2' },
    { master_metadata_album_artist_name: 'artist3' },
    { master_metadata_album_artist_name: 'artist3' },
    { master_metadata_album_artist_name: 'artist3' },
    { master_metadata_album_artist_name: 'artist3' },
    { master_metadata_album_artist_name: 'artist4' },
    { master_metadata_album_artist_name: 'artist4' },
    { master_metadata_album_artist_name: 'artist4' },
    { master_metadata_album_artist_name: 'artist4' },
    { master_metadata_album_artist_name: 'artist5' },
    { master_metadata_album_artist_name: 'artist5' },
    { master_metadata_album_artist_name: 'artist5' },
    { master_metadata_album_artist_name: 'artist5' },
    // Top 10
    { master_metadata_album_artist_name: 'artist6' },
    { master_metadata_album_artist_name: 'artist6' },
    { master_metadata_album_artist_name: 'artist7' },
    { master_metadata_album_artist_name: 'artist7' },
    { master_metadata_album_artist_name: 'artist8' },
    { master_metadata_album_artist_name: 'artist8' },
    { master_metadata_album_artist_name: 'artist9' },
    { master_metadata_album_artist_name: 'artist9' },
    { master_metadata_album_artist_name: 'artist10' },
    { master_metadata_album_artist_name: 'artist10' },
    // Top 20
    { master_metadata_album_artist_name: 'artist11' },
    { master_metadata_album_artist_name: 'artist12' },
    { master_metadata_album_artist_name: 'artist13' },
    { master_metadata_album_artist_name: 'artist14' },
    { master_metadata_album_artist_name: 'artist15' },
    { master_metadata_album_artist_name: 'artist16' },
    { master_metadata_album_artist_name: 'artist17' },
    { master_metadata_album_artist_name: 'artist18' },
    { master_metadata_album_artist_name: 'artist19' },
    { master_metadata_album_artist_name: 'artist20' },
    { master_metadata_album_artist_name: 'artist21' },
    { master_metadata_album_artist_name: 'artist22' },
    { master_metadata_album_artist_name: 'artist23' },
    { master_metadata_album_artist_name: 'artist24' },
]

describe('ConcentrationScore Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('should return concentration metrics', async () => {
        const rows = await testQuery(conn, queryConcentrationScore())

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.top5_pct).toBe(45.45454545454545)
        expect(row.top10_pct).toBe(68.18181818181817)
        expect(row.top20_pct).toBe(90.9090909090909)
    })
})
