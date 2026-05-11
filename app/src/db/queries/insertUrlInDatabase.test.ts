import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest'

import { insertUrlInDatabase } from './insertUrlInDatabase'
import * as adapters from '../../streamProvider'
import { SpotifyStreamProvider } from '../../streamProvider/SpotifyStreamProvider/SpotifyStreamProvider'
import * as precompute from '../precompute'
import * as dataSignal from '../dataSignal'
import { mockDB, mockStreamProviderWithSpy } from './__tests__/test-utils'

import type { StreamRecord } from '../../streamProvider/types'
import { TABLE } from './constants'

describe('insertUrlInDatabase', () => {
    beforeEach(() => {
        vi.spyOn(precompute, 'precomputeDerivedTables').mockResolvedValue(
            undefined
        )
        vi.spyOn(dataSignal, 'dispatchDataLoaded').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('error handling', () => {
        it('should throw error when fetch fails', async () => {
            const connectionMock = mockDB()
            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: false,
                statusText: 'Not Found',
            } as Response)

            const url = new URL('https://example.com/data.json')

            await expect(insertUrlInDatabase(url)).rejects.toThrow(
                'Failed to fetch demo data: Not Found'
            )

            expect(connectionMock.query).not.toHaveBeenCalled()
            expect(connectionMock.insertArrowTable).not.toHaveBeenCalled()
        })

        it('should throw error when no provider detected', async () => {
            const connectionMock = mockDB()
            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                blob: async () =>
                    new Blob([JSON.stringify([])], {
                        type: 'application/json',
                    }),
            } as Response)
            vi.spyOn(adapters, 'detectProvider').mockReturnValue(undefined)

            const url = new URL('https://example.com/data.json')

            await expect(insertUrlInDatabase(url)).rejects.toThrow(
                'No provider found for the demo data URL'
            )

            expect(connectionMock.query).not.toHaveBeenCalled()
            expect(connectionMock.insertArrowTable).not.toHaveBeenCalled()
        })

        it('should throw error when no valid stream records', async () => {
            const connectionMock = mockDB()
            const { provider, processFileSpy } = mockStreamProviderWithSpy([])

            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                blob: async () =>
                    new Blob([JSON.stringify([])], {
                        type: 'application/json',
                    }),
            } as Response)
            vi.spyOn(adapters, 'detectProvider').mockReturnValue(provider)

            const url = new URL('https://example.com/data.json')

            await expect(insertUrlInDatabase(url)).rejects.toThrow(
                'No valid stream records found in demo data'
            )

            expect(processFileSpy).toHaveBeenCalledTimes(1)
            expect(connectionMock.query).not.toHaveBeenCalled()
            expect(connectionMock.insertArrowTable).not.toHaveBeenCalled()
        })
    })

    describe('real provider detection from URL filename', () => {
        it('should detect Spotify provider and process data using real detectProvider', async () => {
            const connectionMock = mockDB()

            const spotifyRawData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Test Song',
                    master_metadata_album_artist_name: 'Test Artist',
                    master_metadata_album_album_name: 'Test Album',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                    platform: 'Test_Platform',
                },
            ]

            vi.spyOn(
                SpotifyStreamProvider.prototype,
                'readFile'
            ).mockResolvedValue(spotifyRawData)
            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                blob: async () =>
                    new Blob([JSON.stringify(spotifyRawData)], {
                        type: 'application/json',
                    }),
            } as Response)

            const url = new URL(
                'https://example.com/Streaming_History_Audio_2024.json'
            )
            await insertUrlInDatabase(url)

            expect(connectionMock.query).toHaveBeenCalledWith(
                `DROP TABLE IF EXISTS ${TABLE}`
            )
            expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)
        })
    })

    describe('successful processing', () => {
        it('should process demo data and insert into database', async () => {
            const connectionMock = mockDB()

            const mockRecords: StreamRecord[] = [
                {
                    track_uri: 'spotify:track:123',
                    track_name: 'Test Song',
                    artist_name: 'Test Artist',
                    album_name: 'Test Album',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                    platform: 'Test_Platform',
                },
            ]
            const { provider, processFileSpy } =
                mockStreamProviderWithSpy(mockRecords)

            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                blob: async () =>
                    new Blob([JSON.stringify(mockRecords)], {
                        type: 'application/json',
                    }),
            } as Response)
            vi.spyOn(adapters, 'detectProvider').mockReturnValue(provider)

            const url = new URL('https://example.com/data.json')
            await insertUrlInDatabase(url)

            expect(processFileSpy).toHaveBeenCalledTimes(1)
            expect(connectionMock.query).toHaveBeenCalledWith(
                `DROP TABLE IF EXISTS ${TABLE}`
            )
            expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)
        })

        it('should call precomputeDerivedTables after insertArrowTable', async () => {
            const connectionMock = mockDB()

            const mockRecords: StreamRecord[] = [
                {
                    track_uri: 'spotify:track:123',
                    track_name: 'Test Song',
                    artist_name: 'Test Artist',
                    album_name: 'Test Album',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                    platform: 'Test_Platform',
                },
            ]
            const { provider } = mockStreamProviderWithSpy(mockRecords)

            vi.spyOn(globalThis, 'fetch').mockResolvedValue({
                ok: true,
                blob: async () =>
                    new Blob([JSON.stringify(mockRecords)], {
                        type: 'application/json',
                    }),
            } as Response)
            vi.spyOn(adapters, 'detectProvider').mockReturnValue(provider)

            const url = new URL('https://example.com/data.json')
            await insertUrlInDatabase(url)

            const precomputeSpy = vi.mocked(precompute.precomputeDerivedTables)
            expect(precomputeSpy).toHaveBeenCalledTimes(1)
            expect(precomputeSpy).toHaveBeenCalledWith(connectionMock)

            const insertCallOrder = (
                connectionMock.insertArrowTable as ReturnType<typeof vi.fn>
            ).mock.invocationCallOrder[0]
            const precomputeCallOrder =
                precomputeSpy.mock.invocationCallOrder[0]
            expect(precomputeCallOrder).toBeGreaterThan(insertCallOrder)
        })
    })
})
