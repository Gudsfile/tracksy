import { describe, it, expect } from 'vitest'
import { FunkWhaleStreamProvider } from './FunkWhaleStreamProvider'
import type { FunkWhaleV1Listen, FunkWhaleV1Response } from './types'
import type { StreamRecord } from '../types'

const V1_LISTEN_WITH_MBID: FunkWhaleV1Listen = {
    id: 1,
    creation_date: '2024-03-15T14:30:00.000Z',
    track: {
        id: 456,
        title: 'Never Gonna Give You Up',
        mbid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        duration: 213,
        artist: {
            id: 1,
            name: 'Rick Astley',
            mbid: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890',
        },
        album: {
            id: 1,
            title: 'Whenever You Need Somebody',
            mbid: 'c1d2e3f4-a5b6-7890-abcd-ef1234567890',
        },
    },
}

const V1_LISTEN_WITHOUT_MBID: FunkWhaleV1Listen = {
    id: 2,
    creation_date: '2024-03-16T10:00:00.000Z',
    track: {
        id: 789,
        title: 'Some Track',
        duration: 180,
        artist: { id: 2, name: 'Some Artist' },
    },
}

const V1_LISTEN_WITHOUT_ALBUM: FunkWhaleV1Listen = {
    id: 3,
    creation_date: '2024-03-17T08:00:00.000Z',
    track: {
        id: 101,
        title: 'Standalone Track',
        mbid: 'd1e2f3a4-b5c6-7890-abcd-ef1234567890',
        duration: 200,
        artist: { id: 3, name: 'Solo Artist' },
    },
}

const V1_LISTEN_WITHOUT_DURATION: FunkWhaleV1Listen = {
    id: 4,
    creation_date: '2024-03-18T12:00:00.000Z',
    track: {
        id: 202,
        title: 'No Duration Track',
        mbid: 'e1f2a3b4-c5d6-7890-abcd-ef1234567890',
        artist: { id: 4, name: 'Artist No Duration' },
    },
}

describe('FunkWhaleStreamProvider', () => {
    const provider = new FunkWhaleStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('funkwhale')
        expect(provider.displayName).toBe('FunkWhale')
        expect(provider.fileContentType).toBe('application/json')
        expect(provider.filePattern).toBeInstanceOf(RegExp)
        expect(provider.acceptedFormats).toBe('JSON')
    })

    describe('validateFile', () => {
        it.each([
            'funkwhale-history.json',
            'FUNKWHALE-HISTORY.JSON',
            'FunkWhale-History.json',
        ])('should return true for %s', (filename) => {
            const file = new File([], filename)
            expect(provider.validateFile(file)).toBe(true)
        })

        it.each([
            'funkwhale.json',
            'history.json',
            'funkwhale-history.csv',
            'Streaming_History_Audio_2024.json',
        ])('should return false for %s', (filename) => {
            const file = new File([], filename)
            expect(provider.validateFile(file)).toBe(false)
        })
    })

    describe('readFile', () => {
        it('should parse v1 paginated response wrapper', async () => {
            const response: FunkWhaleV1Response = {
                count: 1,
                next: null,
                previous: null,
                results: [V1_LISTEN_WITH_MBID],
            }
            const file = new File(
                [JSON.stringify(response)],
                'funkwhale-history.json',
                { type: 'application/json' }
            )
            const result = await provider.readFile(file)
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(V1_LISTEN_WITH_MBID)
        })

        it('should parse bare array', async () => {
            const file = new File(
                [JSON.stringify([V1_LISTEN_WITH_MBID, V1_LISTEN_WITHOUT_MBID])],
                'funkwhale-history.json',
                { type: 'application/json' }
            )
            const result = await provider.readFile(file)
            expect(result).toHaveLength(2)
        })

        it('should throw for unrecognised format', async () => {
            const file = new File(
                [JSON.stringify({ foo: 'bar' })],
                'funkwhale-history.json',
                { type: 'application/json' }
            )
            await expect(provider.readFile(file)).rejects.toThrow(
                'Unrecognised FunkWhale export format'
            )
        })
    })

    describe('transform', () => {
        it('should map v1 listen with MBID to StreamRecord', () => {
            const result = provider.transform([V1_LISTEN_WITH_MBID])

            const expected: StreamRecord = {
                track_uri: 'funkwhale:a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                track_name: 'Never Gonna Give You Up',
                artist_name: 'Rick Astley',
                album_name: 'Whenever You Need Somebody',
                ts: '2024-03-15T14:30:00.000Z',
                ms_played: 213000,
                platform: 'funkwhale',
            }

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should use artist:title fallback track_uri when MBID absent', () => {
            const result = provider.transform([V1_LISTEN_WITHOUT_MBID])
            expect(result[0].track_uri).toBe('funkwhale:Some Artist:Some Track')
        })

        it('should set album_name to empty string when album absent', () => {
            const result = provider.transform([V1_LISTEN_WITHOUT_ALBUM])
            expect(result[0].album_name).toBe('')
        })

        it('should set ms_played to 0 when duration absent', () => {
            const result = provider.transform([V1_LISTEN_WITHOUT_DURATION])
            expect(result[0].ms_played).toBe(0)
        })

        it('should multiply duration by 1000 for ms_played', () => {
            const result = provider.transform([V1_LISTEN_WITH_MBID])
            expect(result[0].ms_played).toBe(213000)
        })

        it('should set platform to "funkwhale"', () => {
            const result = provider.transform([V1_LISTEN_WITH_MBID])
            expect(result[0].platform).toBe('funkwhale')
        })

        it('should pass through creation_date as ts', () => {
            const result = provider.transform([V1_LISTEN_WITH_MBID])
            expect(result[0].ts).toBe('2024-03-15T14:30:00.000Z')
        })
    })

    describe('processFile integration', () => {
        it('should filter out listens shorter than 30 seconds', async () => {
            const shortListen: FunkWhaleV1Listen = {
                ...V1_LISTEN_WITH_MBID,
                track: { ...V1_LISTEN_WITH_MBID.track, duration: 29 },
            }
            const longListen: FunkWhaleV1Listen = {
                ...V1_LISTEN_WITH_MBID,
                id: 99,
                track: { ...V1_LISTEN_WITH_MBID.track, duration: 180 },
            }
            const file = new File(
                [JSON.stringify([shortListen, longListen])],
                'funkwhale-history.json',
                { type: 'application/json' }
            )
            const result = await provider.processFile(file)
            expect(result).toHaveLength(1)
            expect(result[0].ms_played).toBe(180000)
        })
    })
})
