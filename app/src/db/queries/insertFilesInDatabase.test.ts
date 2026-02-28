import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest'

import * as db from '../getDB'
import { insertFilesInDatabase } from './insertFilesInDatabase'
import { convertArrayToFileList } from '../../utils/convertArrayToFileList'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import * as adapters from '../../streamProvider'

import type { StreamRecord } from '../../streamProvider/types'
import { TABLE } from './constants'
import { StreamProvider } from '../../streamProvider/StreamProvider'

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

function mockDB() {
    const connectionMock = {
        query: vi.fn().mockResolvedValue({}),
        insertArrowTable: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection

    vi.spyOn(db, 'getDB').mockResolvedValue({
        conn: connectionMock,
        db: {} as unknown as AsyncDuckDB,
    })

    return connectionMock
}

function mockStreamProviderWithSpy(records: StreamRecord[]) {
    const provider = new (class extends StreamProvider {
        readonly name = 'test'
        readonly displayName = 'Test Provider'
        readonly filePattern = /test\.json$/
        readonly fileContentType = 'application/json'

        readFile = vi.fn(async () => records)
        transform = vi.fn((raw) => raw as StreamRecord[])
    })()

    const processFileSpy = vi.spyOn(provider, 'processFile')

    return { provider, processFileSpy }
}

describe('insertFilesInDatabase', () => {
    let consoleSpy: {
        debug: ReturnType<typeof vi.spyOn>
        warn: ReturnType<typeof vi.spyOn>
        error: ReturnType<typeof vi.spyOn>
    }

    beforeEach(() => {
        consoleSpy = {
            debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
            error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('error handling', () => {
        it('should throw error when no files provided', async () => {
            const connectionMock = mockDB()
            const { provider, processFileSpy } = mockStreamProviderWithSpy([])
            const detectProviderSpy = vi
                .spyOn(adapters, 'detectProvider')
                .mockReturnValue(provider)

            const emptyFileList = convertArrayToFileList([]) // No file

            await expect(insertFilesInDatabase(emptyFileList)).rejects.toThrow(
                'No file to process'
            )

            expect(detectProviderSpy).not.toHaveBeenCalled()
            expect(processFileSpy).not.toHaveBeenCalled()
            expect(connectionMock.query).not.toHaveBeenCalled()
            expect(connectionMock.insertArrowTable).not.toHaveBeenCalled()
            expect(consoleSpy.error).toHaveBeenCalledWith('No file to process')
        })

        it('should throw error when no valid stream records found', async () => {
            const connectionMock = mockDB()
            const { processFileSpy } = mockStreamProviderWithSpy([]) // Empty result

            const filesMock = convertArrayToFileList([
                mockFile(JSON.stringify([]), 'test.json', {
                    type: 'application/json',
                }),
            ])

            await expect(insertFilesInDatabase(filesMock)).rejects.toThrow(
                'No valid stream records found'
            )

            expect(processFileSpy).not.toHaveBeenCalled()
            expect(connectionMock.query).not.toHaveBeenCalled()
            expect(connectionMock.insertArrowTable).not.toHaveBeenCalled()
            expect(consoleSpy.error).toHaveBeenCalledWith(
                'No valid stream records found'
            )
        })
    })

    describe('file processing', () => {
        it('should skip unsupported files with warning', async () => {
            const connectionMock = mockDB()
            const supportedContent = [
                {
                    track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Test Song',
                    master_metadata_album_artist_name: 'Test Artist',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
            ]
            const { provider, processFileSpy } =
                mockStreamProviderWithSpy(supportedContent)
            vi.spyOn(adapters, 'detectProvider')
                .mockReturnValueOnce(undefined) // First file unsupported
                .mockReturnValueOnce(provider) // Second file supported

            const filesMock = convertArrayToFileList([
                mockFile('unsupported content', 'unsupported.txt', {
                    type: 'text/plain',
                }),
                mockFile(JSON.stringify(supportedContent), 'test.json', {
                    type: 'application/json',
                }),
            ])

            await insertFilesInDatabase(filesMock)

            expect(processFileSpy).toHaveBeenCalledTimes(1)
            expect(consoleSpy.warn).toHaveBeenCalledWith(
                'File unsupported.txt does not match any known provider. Skipping.'
            )
            expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)
        })

        it('should process multiple supported files', async () => {
            const connectionMock = mockDB()

            const dataFile1 = [
                {
                    track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song 1',
                    master_metadata_album_artist_name: 'Artist 1',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
            ]
            const dataFile2 = [
                {
                    track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Song 2',
                    master_metadata_album_artist_name: 'Artist 2',
                    ts: '2024-01-02T12:00:00Z',
                    ms_played: 240000,
                },
            ]
            const { provider: provider1, processFileSpy: processFileSpy1 } =
                mockStreamProviderWithSpy(dataFile1)
            const { provider: provider2, processFileSpy: processFileSpy2 } =
                mockStreamProviderWithSpy(dataFile2)

            vi.spyOn(adapters, 'detectProvider')
                .mockReturnValueOnce(provider1)
                .mockReturnValueOnce(provider2)

            const filesMock = convertArrayToFileList([
                mockFile(JSON.stringify(dataFile1), 'file1.json', {
                    type: 'application/json',
                }),
                mockFile(JSON.stringify(dataFile2), 'file2.json', {
                    type: 'application/json',
                }),
            ])

            await insertFilesInDatabase(filesMock)

            expect(processFileSpy1).toHaveBeenCalledTimes(1)
            expect(processFileSpy2).toHaveBeenCalledTimes(1)

            expect(connectionMock.query).toHaveBeenCalledTimes(1)
            expect(connectionMock.query).toHaveBeenCalledWith(
                `DROP TABLE IF EXISTS ${TABLE}`
            )
            expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)

            expect(consoleSpy.debug).toHaveBeenCalledWith(
                `Table ${TABLE} created with 2 records.`
            )
        })
    })

    describe('Spotify integration', () => {
        it('should process Spotify files using the Spotify provider', async () => {
            const connectionMock = mockDB()
            const detectProviderSpy = vi.spyOn(adapters, 'detectProvider')

            const spotifyData = [
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

            await insertFilesInDatabase(filesMock)

            expect(detectProviderSpy).toHaveBeenCalledTimes(2)

            expect(connectionMock.query).toHaveBeenCalledTimes(1)
            expect(connectionMock.query).toHaveBeenCalledWith(
                `DROP TABLE IF EXISTS ${TABLE}`
            )
            expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)

            expect(consoleSpy.debug).toHaveBeenCalledWith(
                'File Streaming_History_Audio_2024.json detected as Spotify format.'
            )
            expect(consoleSpy.debug).toHaveBeenCalledWith(
                'File Streaming_History_Audio_2025.json detected as Spotify format.'
            )
        })
    })
})
