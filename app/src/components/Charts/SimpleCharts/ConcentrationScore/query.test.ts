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

const testDate = '2025-01-01'
const anotherYear = '2024-01-01'
const testData: TestStreamEntry[] = [
    // Top 5
    { ts: testDate, master_metadata_album_artist_name: 'artist1' },
    { ts: testDate, master_metadata_album_artist_name: 'artist1' },
    { ts: testDate, master_metadata_album_artist_name: 'artist1' },
    { ts: testDate, master_metadata_album_artist_name: 'artist1' },
    { ts: testDate, master_metadata_album_artist_name: 'artist2' },
    { ts: testDate, master_metadata_album_artist_name: 'artist2' },
    { ts: testDate, master_metadata_album_artist_name: 'artist2' },
    { ts: testDate, master_metadata_album_artist_name: 'artist2' },
    { ts: testDate, master_metadata_album_artist_name: 'artist3' },
    { ts: testDate, master_metadata_album_artist_name: 'artist3' },
    { ts: testDate, master_metadata_album_artist_name: 'artist3' },
    { ts: testDate, master_metadata_album_artist_name: 'artist3' },
    { ts: testDate, master_metadata_album_artist_name: 'artist4' },
    { ts: testDate, master_metadata_album_artist_name: 'artist4' },
    { ts: testDate, master_metadata_album_artist_name: 'artist4' },
    { ts: testDate, master_metadata_album_artist_name: 'artist4' },
    { ts: testDate, master_metadata_album_artist_name: 'artist5' },
    { ts: testDate, master_metadata_album_artist_name: 'artist5' },
    { ts: testDate, master_metadata_album_artist_name: 'artist5' },
    { ts: testDate, master_metadata_album_artist_name: 'artist5' },
    // Top 10
    { ts: testDate, master_metadata_album_artist_name: 'artist6' },
    { ts: testDate, master_metadata_album_artist_name: 'artist6' },
    { ts: testDate, master_metadata_album_artist_name: 'artist7' },
    { ts: testDate, master_metadata_album_artist_name: 'artist7' },
    { ts: testDate, master_metadata_album_artist_name: 'artist8' },
    { ts: testDate, master_metadata_album_artist_name: 'artist8' },
    { ts: testDate, master_metadata_album_artist_name: 'artist9' },
    { ts: testDate, master_metadata_album_artist_name: 'artist9' },
    { ts: testDate, master_metadata_album_artist_name: 'artist10' },
    { ts: testDate, master_metadata_album_artist_name: 'artist10' },
    // Top 20
    { ts: testDate, master_metadata_album_artist_name: 'artist11' },
    { ts: testDate, master_metadata_album_artist_name: 'artist12' },
    { ts: testDate, master_metadata_album_artist_name: 'artist13' },
    { ts: testDate, master_metadata_album_artist_name: 'artist14' },
    { ts: testDate, master_metadata_album_artist_name: 'artist15' },
    { ts: testDate, master_metadata_album_artist_name: 'artist16' },
    { ts: testDate, master_metadata_album_artist_name: 'artist17' },
    { ts: testDate, master_metadata_album_artist_name: 'artist18' },
    { ts: testDate, master_metadata_album_artist_name: 'artist19' },
    { ts: testDate, master_metadata_album_artist_name: 'artist20' },
    { ts: testDate, master_metadata_album_artist_name: 'artist21' },
    { ts: testDate, master_metadata_album_artist_name: 'artist22' },
    { ts: testDate, master_metadata_album_artist_name: 'artist23' },
    { ts: testDate, master_metadata_album_artist_name: 'artist24' },
    { ts: anotherYear, master_metadata_album_artist_name: 'artist24' },
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
        const rows = await testQuery(conn, queryConcentrationScore(2025))

        expect(rows.length).toBe(1)
        const row = rows[0]

        expect(row.top5_pct).toBe(45.45454545454545)
        expect(row.top10_pct).toBe(68.18181818181817)
        expect(row.top20_pct).toBe(90.9090909090909)
    })
})
