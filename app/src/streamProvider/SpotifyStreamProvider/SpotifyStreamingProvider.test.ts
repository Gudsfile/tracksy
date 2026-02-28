import { describe, it, expect } from 'vitest'
import { SpotifyStreamProvider } from './SpotifyStreamProvider'
import type { SpotifyRawStreamRecord } from './types'
import { StreamRecord } from '../types'

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

describe('SpotifyStreamProvider', () => {
    const provider = new SpotifyStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('spotify')
        expect(provider.displayName).toBe('Spotify')
        expect(provider.fileContentType).toBe('application/json')
        expect(provider.filePattern).toBeInstanceOf(RegExp)
    })

    describe('validateFile', () => {
        it.each([
            'Streaming_History_Audio_2024.json',
            'Streaming_History_Audio_2024_1.json',
            'Streaming_History_Audio_2024-2025.json',
            'Streaming_History_Audio_2024-2025_10.json',
        ])(
            'should return true for %s as it matches Spotify filename pattern',
            (filename) => {
                const file = mockFile('[]', filename, {
                    type: 'application/json',
                })
                expect(provider.validateFile(file)).toBe(true)
            }
        )

        it.each([
            'Streaming_2024-2025_1000.json',
            'History_Audio_2024-2025_1000.json',
            'spotify_data.json',
            'music_history.json',
        ])(
            'should return false for %s as it does not match Spotify filename pattern',
            (filename) => {
                const file = mockFile('[]', filename, {
                    type: 'application/json',
                })
                expect(provider.validateFile(file)).toBe(false)
            }
        )
    })

    describe('readFile', () => {
        it('should parse valid JSON file', async () => {
            const jsonData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
            ]
            const file = mockFile(JSON.stringify(jsonData), 'test.json', {
                type: 'application/json',
            })

            const result = await provider.readFile(file)
            expect(result).toEqual(jsonData)
        })

        it('should throw error for invalid JSON', async () => {
            const file = mockFile('invalid json', 'test.json', {
                type: 'application/json',
            })

            await expect(provider.readFile(file)).rejects.toThrow()
        })

        it('should throw error for non-array JSON', async () => {
            const file = mockFile('{"not": "an array"}', 'test.json', {
                type: 'application/json',
            })

            await expect(provider.readFile(file)).rejects.toThrow(
                'Expected JSON array of streaming records'
            )
        })
    })

    describe('transform', () => {
        it('should map spotify_track_uri to track_uri and keep the rest unchanged', () => {
            const rawData: SpotifyRawStreamRecord[] = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song 1',
                    master_metadata_album_artist_name: 'Artist 1',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
                {
                    spotify_track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Song 2',
                    master_metadata_album_artist_name: 'Artist 2',
                    ts: '2024-01-01T12:30:00Z',
                    ms_played: 240000,
                },
            ]

            const result = provider.transform(rawData)

            const expected: StreamRecord[] = [
                {
                    track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song 1',
                    master_metadata_album_artist_name: 'Artist 1',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
                {
                    track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Song 2',
                    master_metadata_album_artist_name: 'Artist 2',
                    ts: '2024-01-01T12:30:00Z',
                    ms_played: 240000,
                },
            ]

            expect(result[0].track_uri).toBeDefined()
            expect(result[0].spotify_track_uri).toBeUndefined()
            expect(result).toEqual(expected)
        })
    })

    describe('processFile integration', () => {
        it('should process complete pipeline correctly', async () => {
            const validRecord = {
                spotify_track_uri: 'spotify:track:123',
                master_metadata_track_name: 'Song',
                master_metadata_album_artist_name: 'Artist',
                ts: '2024-01-01T12:00:00Z',
                ms_played: 180000,
            }

            const invalidRecords = [
                {
                    spotify_track_uri: null, // Invalid - podcast
                    master_metadata_track_name: 'Podcast Episode',
                    ts: '2024-01-01T13:00:00Z',
                    ms_played: 3600000,
                },
                {
                    spotify_track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Short Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T14:00:00Z',
                    ms_played: 29000, // Too short (< 30s)
                },
                {
                    spotify_track_uri: 'spotify:track:789',
                    master_metadata_track_name: 'No Artist',
                    // Missing master_metadata_album_artist_name
                    ts: '2024-01-01T15:00:00Z',
                    ms_played: 180000,
                },
            ]

            const jsonData = [validRecord, ...invalidRecords]
            const file = mockFile(
                JSON.stringify(jsonData),
                'Streaming_History_Audio_2024.json',
                { type: 'application/json' }
            )

            const result = await provider.processFile(file)

            const expected = {
                track_uri: 'spotify:track:123',
                master_metadata_track_name: 'Song',
                master_metadata_album_artist_name: 'Artist',
                ts: '2024-01-01T12:00:00Z',
                ms_played: 180000,
            }

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should return empty array for file with no valid records', async () => {
            const invalidData = [
                {
                    spotify_track_uri: null, // Invalid - podcast
                    master_metadata_track_name: 'Podcast Episode',
                    ts: '2024-01-01T13:00:00Z',
                    ms_played: 3600000,
                },
                {
                    spotify_track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Short Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T14:00:00Z',
                    ms_played: 15000, // Too short (< 30s)
                },
            ]

            const file = mockFile(
                JSON.stringify(invalidData),
                'Streaming_History_Audio_2024.json',
                { type: 'application/json' }
            )

            const result = await provider.processFile(file)
            expect(result).toHaveLength(0)
        })
    })
})
