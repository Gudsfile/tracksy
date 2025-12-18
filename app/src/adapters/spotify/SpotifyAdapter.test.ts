import { describe, it, expect } from 'vitest'
import { SpotifyAdapter } from './SpotifyAdapter'

describe('SpotifyAdapter', () => {
    const adapter = new SpotifyAdapter()

    describe('getMetadata', () => {
        it('should return correct metadata', () => {
            const metadata = adapter.getMetadata()
            expect(metadata.provider).toBe('spotify')
            expect(metadata.displayName).toBe('Spotify')
            expect(metadata.filePattern).toBeInstanceOf(RegExp)
        })
    })

    describe('validateFile', () => {
        it.each([
            'Streaming_History_Audio_2024.json',
            'Streaming_History_Audio_2024_1.json',
            'Streaming_History_Audio_2024-2025.json',
            'Streaming_History_Audio_2024-2025_10.json',
        ])(
            'should return true for %s as is a correct Spotify filename pattern',
            (filename) => {
                const file = new File([], filename)
                expect(adapter.validateFile(file)).toBe(true)
            }
        )

        it.each([
            'Streaming_2024-2025_1000.json',
            'History_Audio_2024-2025_1000.json',
        ])(
            'should return false for %s as is not a correct Spotify filename pattern',
            (filename) => {
                const file = new File([], filename)
                expect(adapter.validateFile(file)).toBe(false)
            }
        )
    })

    describe('transform', () => {
        it('should filter out non-music streams', () => {
            const rawData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 180000,
                },
                {
                    spotify_track_uri: null, // Podcast
                    master_metadata_track_name: 'Podcast Episode',
                    ts: '2024-01-01T13:00:00Z',
                    ms_played: 3600000,
                },
            ]

            const result = adapter.transform(rawData)
            expect(result).toHaveLength(1)
            expect(result[0].spotify_track_uri).toBe('spotify:track:123')
        })

        it('should filter out too short streams', () => {
            const rawData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T12:00:00Z',
                    ms_played: 29000, // 29 seconds is too short
                },
                {
                    spotify_track_uri: 'spotify:track:456',
                    master_metadata_track_name: 'Song',
                    master_metadata_album_artist_name: 'Artist',
                    ts: '2024-01-01T13:00:00Z',
                    ms_played: 3600000,
                },
            ]

            const result = adapter.transform(rawData)
            expect(result).toHaveLength(1)
            expect(result[0].spotify_track_uri).toBe('spotify:track:456')
        })

        it('should filter out invalid records without timestamp', () => {
            const rawData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song',
                    ms_played: 180000,
                    // Missing ts
                },
            ]

            const result = adapter.transform(rawData)
            expect(result).toHaveLength(0)
        })

        it('should filter out invalid records without ms_played', () => {
            const rawData = [
                {
                    spotify_track_uri: 'spotify:track:123',
                    master_metadata_track_name: 'Song',
                    ts: '2024-01-01T12:00:00Z',
                    // Missing ms_played
                },
            ]

            const result = adapter.transform(rawData)
            expect(result).toHaveLength(0)
        })

        it('should keep valid music streams', () => {
            const rawData = [
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

            const result = adapter.transform(rawData)
            expect(result).toHaveLength(2)
        })
    })
})
