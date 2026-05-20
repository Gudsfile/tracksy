import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppleMusicStreamProvider } from './AppleMusicStreamProvider'
import type { AppleMusicRawRecord } from './types'
import type { StreamRecord } from '../types'

function mockFile(
    buffer: ArrayBuffer,
    name: string,
    options: { type: string }
) {
    return {
        name,
        arrayBuffer: async () => buffer,
        type: options.type,
        size: buffer.byteLength,
    } as unknown as File
}

const CSV_TYPE = 'text/csv'

const RAW_AUDIO: AppleMusicRawRecord = {
    'Song Name': 'Never Gonna Give You Up',
    'Album Name': null,
    'Container Artist Name': null,
    'Media Type': 'AUDIO',
    'Event Start Timestamp': new Date('2024-03-15T14:30:00.000Z'),
    'Play Duration Milliseconds': 213000,
    'Client Platform': 'FUSE',
}

const RAW_VIDEO: AppleMusicRawRecord = {
    'Song Name': 'Some Video',
    'Album Name': null,
    'Container Artist Name': null,
    'Media Type': 'VIDEO',
    'Event Start Timestamp': new Date('2024-03-15T15:00:00.000Z'),
    'Play Duration Milliseconds': 120000,
    'Client Platform': 'FUSE',
}

describe('AppleMusicStreamProvider', () => {
    const provider = new AppleMusicStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('apple-music')
        expect(provider.displayName).toBe('Apple Music')
        expect(provider.fileContentType).toBe(CSV_TYPE)
        expect(provider.filePattern).toBeInstanceOf(RegExp)
        expect(provider.acceptedFormats).toBe('ZIP/CSV')
    })

    describe('validateFile', () => {
        it.each([
            'Apple Music Play Activity.csv',
            'apple music play activity.csv',
            'APPLE MUSIC PLAY ACTIVITY.CSV',
        ])('should return true for %s', (filename) => {
            const file = mockFile(new ArrayBuffer(0), filename, {
                type: CSV_TYPE,
            })
            expect(provider.validateFile(file)).toBe(true)
        })

        it.each([
            'AppleMusicPlayActivity.csv',
            'Apple Music.csv',
            'Apple Music Play Activity.json',
            'play_activity.csv',
        ])('should return false for %s', (filename) => {
            const file = mockFile(new ArrayBuffer(0), filename, {
                type: CSV_TYPE,
            })
            expect(provider.validateFile(file)).toBe(false)
        })
    })

    describe('transform', () => {
        it('should map AUDIO record to StreamRecord', () => {
            const result = provider.transform([RAW_AUDIO])
            const expected: StreamRecord = {
                track_uri: 'apple-music:Never Gonna Give You Up',
                track_name: 'Never Gonna Give You Up',
                artist_name: '',
                album_name: '',
                ts: '2024-03-15T14:30:00.000Z',
                ms_played: 213000,
                platform: 'FUSE',
            }
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should filter out non-AUDIO records', () => {
            const result = provider.transform([RAW_AUDIO, RAW_VIDEO])
            expect(result).toHaveLength(1)
            expect(result[0].track_name).toBe('Never Gonna Give You Up')
        })

        it('should set artist_name to empty string', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].artist_name).toBe('')
        })

        it('should set album_name to empty string', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].album_name).toBe('')
        })

        it('should guard against negative Play Duration Milliseconds', () => {
            const record: AppleMusicRawRecord = {
                ...RAW_AUDIO,
                'Play Duration Milliseconds': -140027,
            }
            const result = provider.transform([record])
            expect(result[0].ms_played).toBe(0)
        })

        it('should guard against null Play Duration Milliseconds', () => {
            const record: AppleMusicRawRecord = {
                ...RAW_AUDIO,
                'Play Duration Milliseconds': null,
            }
            const result = provider.transform([record])
            expect(result[0].ms_played).toBe(0)
        })

        it('should handle string-typed Event Start Timestamp', () => {
            const record: AppleMusicRawRecord = {
                ...RAW_AUDIO,
                'Event Start Timestamp': '2024-03-15T14:30:00.000Z',
            }
            const result = provider.transform([record])
            expect(result[0].ts).toBe('2024-03-15T14:30:00.000Z')
        })

        it('should handle null Event Start Timestamp gracefully', () => {
            const record: AppleMusicRawRecord = {
                ...RAW_AUDIO,
                'Event Start Timestamp': null,
            }
            const result = provider.transform([record])
            expect(result[0].ts).toBe('')
        })

        it('should build track_uri with apple-music prefix', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].track_uri).toBe(
                'apple-music:Never Gonna Give You Up'
            )
        })

        it('should handle empty input array', () => {
            expect(provider.transform([])).toEqual([])
        })
    })

    describe('readFile', () => {
        let mockConn: {
            query: ReturnType<typeof vi.fn>
        }
        let mockDb: {
            registerFileBuffer: ReturnType<typeof vi.fn>
            dropFile: ReturnType<typeof vi.fn>
        }

        beforeEach(() => {
            mockConn = {
                query: vi.fn(),
            }
            mockDb = {
                registerFileBuffer: vi.fn(),
                dropFile: vi.fn(),
            }
        })

        it('should register, query, and drop the temp file', async () => {
            const mockRow = {
                toJSON: () => ({ ...RAW_AUDIO }),
            }
            mockConn.query.mockResolvedValue({
                toArray: () => [mockRow],
            })

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDb as never,
                conn: mockConn as never,
            })

            const file = mockFile(
                new ArrayBuffer(8),
                'Apple Music Play Activity.csv',
                {
                    type: CSV_TYPE,
                }
            )

            const result = await provider.readFile(file)

            expect(mockDb.registerFileBuffer).toHaveBeenCalledWith(
                '_apple_music_tmp.csv',
                expect.any(Uint8Array)
            )
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('read_csv')
            )
            expect(mockDb.dropFile).toHaveBeenCalledWith('_apple_music_tmp.csv')
            expect(result).toHaveLength(1)
        })

        it('should drop temp file even if query fails', async () => {
            mockConn.query.mockRejectedValue(new Error('query failed'))

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDb as never,
                conn: mockConn as never,
            })

            const file = mockFile(
                new ArrayBuffer(8),
                'Apple Music Play Activity.csv',
                {
                    type: CSV_TYPE,
                }
            )

            await expect(provider.readFile(file)).rejects.toThrow(
                'query failed'
            )
            expect(mockDb.dropFile).toHaveBeenCalledWith('_apple_music_tmp.csv')
        })
    })
})
