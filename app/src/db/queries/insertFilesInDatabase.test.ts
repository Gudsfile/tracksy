import { vi, describe, it, expect } from 'vitest'

import * as db from '../getDB'
import { insertFilesInDatabase } from './insertFilesInDatabase'
import { convertArrayToFileList } from '../../utils/convertArrayToFileList'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { detectProvider } from '../../adapters'
import type { StreamRecord } from '../../adapters/types'
import { TABLE } from './constants'

/**
 * We use this mock function due to JSDOM not supporting full File API : https://developer.mozilla.org/en-US/docs/Web/API/Blob/text
 * missing File.text method
 * https://github.com/jsdom/jsdom/blob/04541b377d9949d6ab56866760b7883a23db0577/lib/jsdom/living/file-api/Blob-impl.js#L11
 */
function mockFile(content: string, name: string, options: { type: string }) {
    return {
        name,
        text: async () => content,
        type: options.type,
        size: content.length,
    } as unknown as File
}

describe('insertFilesInDatabase', () => {
    it.only('should process Spotify files using SpotifyAdapter', async () => {
        const connectionMock = {
            query: vi.fn().mockResolvedValue({}),
            insertArrowTable: vi.fn().mockResolvedValue({}),
        } as unknown as AsyncDuckDBConnection

        //let tableData: any[] = []

        //const connectionMock = {
        //    insertArrowTable: vi.fn().mockImplementation((data: any[]) => {
        //        tableData.push(...data) // to simulate the insertion
        //        return Promise.resolve({})
        //    }),
        //    query: vi.fn().mockImplementation((sql: string) => {
        //        if (sql.startsWith(`SELECT COUNT(*)`)) {
        //            return Promise.resolve({
        //                toArray: () => [{ count: tableData.length }]
        //            })
        //        }
        //        return Promise.resolve({})
        //    }),
        //} as unknown as AsyncDuckDBConnection

        vi.spyOn(db, 'getDB').mockResolvedValue({
            conn: connectionMock,
            db: {} as unknown as AsyncDuckDB,
        })

        const spotifyData: StreamRecord[] = [
            {
                spotify_track_uri: 'spotify:track:123',
                master_metadata_track_name: 'Test Song',
                master_metadata_album_artist_name: 'Test Artist',
                ts: '2024-01-01T12:00:00Z',
                ms_played: 180000,
            },
        ]

        const filesMock = convertArrayToFileList([
            mockFile(
                JSON.stringify(spotifyData),
                'Streaming_History_Audio_2024.json',
                { type: 'application/json' }
            ),
            mockFile(
                JSON.stringify(spotifyData),
                'Streaming_History_Audio_2025.json',
                { type: 'application/json' }
            ),
        ])

        const adapter = detectProvider(filesMock[0])
        expect(adapter).not.toBeNull()
        expect(adapter?.getMetadata().provider).toBe('spotify')

        await insertFilesInDatabase(filesMock)

        expect(connectionMock.query).toHaveBeenCalledTimes(1)
        expect(connectionMock.query).toHaveBeenCalledWith(
            `DROP TABLE IF EXISTS ${TABLE}`
        )

        expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)

        //const result = await connectionMock.query(
        //    `SELECT COUNT(*) as count FROM ${TABLE}`
        //)
        //const count = result.toArray()[0].count
        //expect(count).toBe(1)
    })
})
