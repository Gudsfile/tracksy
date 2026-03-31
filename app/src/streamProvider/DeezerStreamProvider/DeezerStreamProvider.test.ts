import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeezerStreamProvider } from './DeezerStreamProvider'
import type { DeezerRawStreamRecord } from './types'
import type { StreamRecord } from '../types'

/**
 * Mock file with arrayBuffer support (JSDOM does not implement File.arrayBuffer fully)
 */
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

const XLSX_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const RAW_RECORD: DeezerRawStreamRecord = {
    'Song Title': 'Never Gonna Give You Up',
    Artist: 'Rick Astley',
    ISRC: 'GBAYE8800243',
    'Album Title': 'Whenever You Need Somebody',
    'IP Address': '192.168.0.1',
    'Listening Time': '213',
    'Platform Name': 'web',
    'Platform Model': '',
    Date: '2024-10-24 23:00:00',
}

describe('DeezerStreamProvider', () => {
    const provider = new DeezerStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('deezer')
        expect(provider.displayName).toBe('Deezer')
        expect(provider.fileContentType).toBe(XLSX_TYPE)
        expect(provider.filePattern).toBeInstanceOf(RegExp)
    })

    describe('validateFile', () => {
        it.each([
            'deezer-data_1234567890.xlsx',
            'deezer-data_0000000000.xlsx',
            'DEEZER-DATA_9999999999.xlsx',
        ])(
            'should return true for %s as it matches Deezer filename pattern',
            (filename) => {
                const file = mockFile(new ArrayBuffer(0), filename, {
                    type: XLSX_TYPE,
                })
                expect(provider.validateFile(file)).toBe(true)
            }
        )

        it.each([
            'deezer-data_123.xlsx',
            'deezer-data_12345678901.xlsx',
            'deezer_data_1234567890.xlsx',
            'Streaming_History_Audio_2024.json',
            'deezer-data_1234567890.json',
        ])(
            'should return false for %s as it does not match Deezer filename pattern',
            (filename) => {
                const file = mockFile(new ArrayBuffer(0), filename, {
                    type: XLSX_TYPE,
                })
                expect(provider.validateFile(file)).toBe(false)
            }
        )
    })

    describe('transform', () => {
        it('should map DeezerRawStreamRecord to StreamRecord', () => {
            const result = provider.transform([RAW_RECORD])

            const expected: StreamRecord = {
                track_uri: 'isrc:GBAYE8800243',
                track_name: 'Never Gonna Give You Up',
                artist_name: 'Rick Astley',
                album_name: 'Whenever You Need Somebody',
                ts: '2024-10-24T23:00:00Z',
                ms_played: 213000,
                ip_addr: '192.168.0.1',
                platform_name: 'web',
                platform_model: '',
            }

            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should handle numeric Listening Time from DuckDB', () => {
            const raw = { ...RAW_RECORD, 'Listening Time': 173 }
            const result = provider.transform([raw])
            expect(result[0].ms_played).toBe(173000)
        })

        it('should produce 0 ms_played for non-numeric Listening Time', () => {
            const raw = { ...RAW_RECORD, 'Listening Time': '' }
            const result = provider.transform([raw])
            expect(result[0].ms_played).toBe(0)
        })

        it('should convert Date to ISO 8601', () => {
            const result = provider.transform([RAW_RECORD])
            expect(result[0].ts).toBe('2024-10-24T23:00:00Z')
        })

        it('should prefix ISRC with isrc:', () => {
            const result = provider.transform([RAW_RECORD])
            expect(result[0].track_uri).toBe('isrc:GBAYE8800243')
        })
    })

    describe('readFile', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        it('should call getDB and query the listening history sheet', async () => {
            const mockConn = {
                query: vi.fn().mockResolvedValue({
                    toArray: () => [{ toJSON: () => RAW_RECORD }],
                }),
            }
            const mockDB = {
                registerFileBuffer: vi.fn().mockResolvedValue(undefined),
                dropFile: vi.fn().mockResolvedValue(undefined),
            }

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(
                new ArrayBuffer(8),
                'deezer-data_1234567890.xlsx',
                {
                    type: XLSX_TYPE,
                }
            )

            const result = await provider.readFile(file)

            expect(mockDB.registerFileBuffer).toHaveBeenCalledWith(
                '_deezer_tmp.xlsx',
                expect.any(Uint8Array)
            )
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('10_listeningHistory')
            )
            expect(mockDB.dropFile).toHaveBeenCalledWith('_deezer_tmp.xlsx')
            expect(result).toEqual([RAW_RECORD])
        })

        it('should drop the temp file even when query throws', async () => {
            const mockConn = {
                query: vi.fn().mockRejectedValue(new Error('sheet not found')),
            }
            const mockDB = {
                registerFileBuffer: vi.fn().mockResolvedValue(undefined),
                dropFile: vi.fn().mockResolvedValue(undefined),
            }

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(
                new ArrayBuffer(8),
                'deezer-data_1234567890.xlsx',
                {
                    type: XLSX_TYPE,
                }
            )

            await expect(provider.readFile(file)).rejects.toThrow(
                'sheet not found'
            )
            expect(mockDB.dropFile).toHaveBeenCalledWith('_deezer_tmp.xlsx')
        })
    })

    describe('processFile integration', () => {
        beforeEach(() => {
            vi.restoreAllMocks()
        })

        it('should filter out records shorter than 30 seconds', async () => {
            const shortRecord = { ...RAW_RECORD, 'Listening Time': '29' }
            const longRecord = { ...RAW_RECORD, 'Listening Time': '180' }

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

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDB as never,
                conn: mockConn as never,
            })

            const file = mockFile(
                new ArrayBuffer(8),
                'deezer-data_1234567890.xlsx',
                { type: XLSX_TYPE }
            )

            const result = await provider.processFile(file)

            expect(result).toHaveLength(1)
            expect(result[0].ms_played).toBe(180000)
        })
    })
})
