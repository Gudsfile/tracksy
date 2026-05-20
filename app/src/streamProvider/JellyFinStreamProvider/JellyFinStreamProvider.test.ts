import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JellyFinStreamProvider } from './JellyFinStreamProvider'
import type { JellyFinRawRecord } from './types'
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

const RAW_AUDIO: JellyFinRawRecord = {
    DateCreated: '2024-03-15 14:30:00',
    UserId: 'user-abc-123',
    ItemId: 'item-def-456',
    ItemType: 'Audio',
    ItemName: 'Never Gonna Give You Up',
    PlaybackMethod: 'DirectPlay',
    ClientName: 'Jellyfin Web',
    DeviceName: 'Chrome',
    PlayDuration: '213',
}

const RAW_MOVIE: JellyFinRawRecord = {
    ...RAW_AUDIO,
    ItemType: 'Movie',
    ItemName: 'Some Movie',
}

describe('JellyFinStreamProvider', () => {
    const provider = new JellyFinStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('jellyfin')
        expect(provider.displayName).toBe('JellyFin')
        expect(provider.fileContentType).toBe(CSV_TYPE)
        expect(provider.filePattern).toBeInstanceOf(RegExp)
        expect(provider.acceptedFormats).toBe('CSV')
    })

    describe('validateFile', () => {
        it.each(['playback_report.csv', 'PLAYBACK_REPORT.CSV'])(
            'should return true for %s',
            (filename) => {
                const file = mockFile(new ArrayBuffer(0), filename, {
                    type: CSV_TYPE,
                })
                expect(provider.validateFile(file)).toBe(true)
            }
        )

        it.each(['report.csv', 'playback.csv', 'playback_report.json'])(
            'should return false for %s',
            (filename) => {
                const file = mockFile(new ArrayBuffer(0), filename, {
                    type: CSV_TYPE,
                })
                expect(provider.validateFile(file)).toBe(false)
            }
        )
    })

    describe('transform', () => {
        it('should map Audio record to StreamRecord', () => {
            const result = provider.transform([RAW_AUDIO])
            const expected: StreamRecord = {
                track_uri: 'jellyfin:item-def-456',
                track_name: 'Never Gonna Give You Up',
                artist_name: '',
                album_name: '',
                ts: '2024-03-15T14:30:00Z',
                ms_played: 213000,
                platform: 'Jellyfin Web',
            }
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should filter out non-Audio rows', () => {
            const result = provider.transform([RAW_AUDIO, RAW_MOVIE])
            expect(result).toHaveLength(1)
            expect(result[0].track_name).toBe('Never Gonna Give You Up')
        })

        it('should convert DateCreated to ISO 8601', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].ts).toBe('2024-03-15T14:30:00Z')
        })

        it('should multiply PlayDuration seconds by 1000', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].ms_played).toBe(213000)
        })

        it('should handle PlayDuration as number from DuckDB', () => {
            const raw = { ...RAW_AUDIO, PlayDuration: 180 }
            const result = provider.transform([raw])
            expect(result[0].ms_played).toBe(180000)
        })

        it('should set ms_played to 0 for negative PlayDuration (Swiftfin bug)', () => {
            const raw = { ...RAW_AUDIO, PlayDuration: '-2147483648' }
            const result = provider.transform([raw])
            expect(result[0].ms_played).toBe(0)
        })

        it('should set ms_played to 0 for zero PlayDuration', () => {
            const raw = { ...RAW_AUDIO, PlayDuration: '0' }
            const result = provider.transform([raw])
            expect(result[0].ms_played).toBe(0)
        })

        it('should set artist_name and album_name to empty strings', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].artist_name).toBe('')
            expect(result[0].album_name).toBe('')
        })

        it('should use ClientName as platform', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].platform).toBe('Jellyfin Web')
        })

        it('should prefix ItemId with jellyfin: in track_uri', () => {
            const result = provider.transform([RAW_AUDIO])
            expect(result[0].track_uri).toBe('jellyfin:item-def-456')
        })
    })

    describe('readFile', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        it('should call getDB and query the CSV', async () => {
            const mockConn = {
                query: vi.fn().mockResolvedValue({
                    toArray: () => [{ toJSON: () => RAW_AUDIO }],
                }),
            }
            const mockDB = {
                registerFileBuffer: vi.fn().mockResolvedValue(undefined),
                dropFile: vi.fn().mockResolvedValue(undefined),
            }

            const getDBModule = await import('../../db/getDB')
            vi.spyOn(getDBModule, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(new ArrayBuffer(8), 'playback_report.csv', {
                type: CSV_TYPE,
            })
            const result = await provider.readFile(file)

            expect(mockDB.registerFileBuffer).toHaveBeenCalledWith(
                '_jellyfin_tmp.csv',
                expect.any(Uint8Array)
            )
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('_jellyfin_tmp.csv')
            )
            expect(mockDB.dropFile).toHaveBeenCalledWith('_jellyfin_tmp.csv')
            expect(result).toEqual([RAW_AUDIO])
        })

        it('should drop the temp file even when query throws', async () => {
            const mockConn = {
                query: vi.fn().mockRejectedValue(new Error('CSV error')),
            }
            const mockDB = {
                registerFileBuffer: vi.fn().mockResolvedValue(undefined),
                dropFile: vi.fn().mockResolvedValue(undefined),
            }

            const getDBModule = await import('../../db/getDB')
            vi.spyOn(getDBModule, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(new ArrayBuffer(8), 'playback_report.csv', {
                type: CSV_TYPE,
            })
            await expect(provider.readFile(file)).rejects.toThrow()
            expect(mockDB.dropFile).toHaveBeenCalledWith('_jellyfin_tmp.csv')
        })
    })

    describe('processFile integration', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        it('should filter out records shorter than 30 seconds', async () => {
            const shortRecord = { ...RAW_AUDIO, PlayDuration: '29' }
            const longRecord = { ...RAW_AUDIO, PlayDuration: '180' }

            const mockConn = {
                query: vi.fn().mockResolvedValue({
                    toArray: () =>
                        [shortRecord, longRecord].map((r) => ({
                            toJSON: () => r,
                        })),
                }),
            }
            const mockDB = {
                registerFileBuffer: vi.fn().mockResolvedValue(undefined),
                dropFile: vi.fn().mockResolvedValue(undefined),
            }

            const getDBModule = await import('../../db/getDB')
            vi.spyOn(getDBModule, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(new ArrayBuffer(8), 'playback_report.csv', {
                type: CSV_TYPE,
            })
            const result = await provider.processFile(file)

            expect(result).toHaveLength(1)
            expect(result[0].ms_played).toBe(180000)
        })
    })
})
