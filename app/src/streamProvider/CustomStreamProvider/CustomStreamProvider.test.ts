import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomStreamProvider } from './CustomStreamProvider'
import type { CustomRawRecord } from './types'
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

const RAW_RECORD: CustomRawRecord = {
    ts: '2024-03-15T14:30:00.000Z',
    track_name: 'Never Gonna Give You Up',
    artist_name: 'Rick Astley',
    album_name: 'Whenever You Need Somebody',
    ms_played: 213000,
    track_uri: 'custom:rick-astley:ngru',
    platform: 'tidal',
}

describe('CustomStreamProvider', () => {
    const provider = new CustomStreamProvider()

    it('should return correct metadata', () => {
        expect(provider.name).toBe('custom')
        expect(provider.fileContentType).toBe(CSV_TYPE)
        expect(provider.filePattern).toBeInstanceOf(RegExp)
        expect(provider.acceptedFormats).toBe('CSV')
    })

    describe('validateFile', () => {
        it.each(['tracksy-custom.csv', 'TRACKSY-CUSTOM.CSV'])(
            'should return true for %s',
            (filename) => {
                const file = mockFile(new ArrayBuffer(0), filename, {
                    type: CSV_TYPE,
                })
                expect(provider.validateFile(file)).toBe(true)
            }
        )

        it.each([
            'custom.csv',
            'tracksy.csv',
            'tracksy-custom.json',
            'my-data.csv',
        ])('should return false for %s', (filename) => {
            const file = mockFile(new ArrayBuffer(0), filename, {
                type: CSV_TYPE,
            })
            expect(provider.validateFile(file)).toBe(false)
        })
    })

    describe('transform', () => {
        it('should map raw record to StreamRecord', () => {
            const result = provider.transform([RAW_RECORD])
            const expected: StreamRecord = {
                track_uri: 'custom:rick-astley:ngru',
                track_name: 'Never Gonna Give You Up',
                artist_name: 'Rick Astley',
                album_name: 'Whenever You Need Somebody',
                ts: '2024-03-15T14:30:00.000Z',
                ms_played: 213000,
                platform: 'tidal',
            }
            expect(result).toHaveLength(1)
            expect(result[0]).toEqual(expected)
        })

        it('should guard against negative ms_played', () => {
            const record: CustomRawRecord = { ...RAW_RECORD, ms_played: -1000 }
            const result = provider.transform([record])
            expect(result[0].ms_played).toBe(0)
        })

        it('should guard against null ms_played', () => {
            const record: CustomRawRecord = { ...RAW_RECORD, ms_played: null }
            const result = provider.transform([record])
            expect(result[0].ms_played).toBe(0)
        })

        it('should fall back to "custom" platform if missing', () => {
            const record: CustomRawRecord = { ...RAW_RECORD, platform: null }
            const result = provider.transform([record])
            expect(result[0].platform).toBe('custom')
        })

        it('should coerce numeric ms_played string', () => {
            const record: CustomRawRecord = {
                ...RAW_RECORD,
                ms_played: '213000',
            }
            const result = provider.transform([record])
            expect(result[0].ms_played).toBe(213000)
        })

        it('should handle empty input array', () => {
            expect(provider.transform([])).toEqual([])
        })
    })

    describe('readFile', () => {
        let mockConn: { query: ReturnType<typeof vi.fn> }
        let mockDb: {
            registerFileBuffer: ReturnType<typeof vi.fn>
            dropFile: ReturnType<typeof vi.fn>
        }

        beforeEach(() => {
            mockConn = { query: vi.fn() }
            mockDb = {
                registerFileBuffer: vi.fn(),
                dropFile: vi.fn(),
            }
        })

        it('should register, query, and drop the temp file', async () => {
            const mockRow = { toJSON: () => ({ ...RAW_RECORD }) }
            mockConn.query.mockResolvedValue({ toArray: () => [mockRow] })

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDb as never,
                conn: mockConn as never,
            })

            const file = mockFile(new ArrayBuffer(8), 'tracksy-custom.csv', {
                type: CSV_TYPE,
            })
            const result = await provider.readFile(file)

            expect(mockDb.registerFileBuffer).toHaveBeenCalledWith(
                '_custom_tmp.csv',
                expect.any(Uint8Array)
            )
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('read_csv')
            )
            expect(mockDb.dropFile).toHaveBeenCalledWith('_custom_tmp.csv')
            expect(result).toHaveLength(1)
        })

        it('should drop temp file even if query fails', async () => {
            mockConn.query.mockRejectedValue(new Error('query failed'))

            const getDB = await import('../../db/getDB')
            vi.spyOn(getDB, 'getDB').mockResolvedValue({
                db: mockDb as never,
                conn: mockConn as never,
            })

            const file = mockFile(new ArrayBuffer(8), 'tracksy-custom.csv', {
                type: CSV_TYPE,
            })
            await expect(provider.readFile(file)).rejects.toThrow(
                'query failed'
            )
            expect(mockDb.dropFile).toHaveBeenCalledWith('_custom_tmp.csv')
        })
    })
})
