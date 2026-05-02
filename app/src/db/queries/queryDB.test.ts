import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    AsyncPreparedStatement,
} from '@duckdb/duckdb-wasm'
import * as db from '../getDB'
import { queryDBAsJSON } from './queryDB'

describe('queryDBAsJSON', () => {
    const mockTable = {
        toArray: () =>
            [
                { artist: 'Daft Punk', streams: 100 },
                { artist: 'Veridis Project', streams: 50 },
            ].map((row) => ({ toJSON: () => row })),
    }

    const mockStmt = {
        query: vi.fn(),
        close: vi.fn(),
    } as unknown as AsyncPreparedStatement

    const mockConnection = {
        query: vi.fn(),
        prepare: vi.fn(),
    } as unknown as AsyncDuckDBConnection

    beforeEach(() => {
        vi.spyOn(db, 'getDB').mockResolvedValue({
            conn: mockConnection,
            db: {} as unknown as AsyncDuckDB,
        })
        vi.clearAllMocks()
    })

    it('should execute a plain query and return a JSON array', async () => {
        const mockData = [
            { artist: 'Daft Punk', streams: 100 },
            { artist: 'Veridis Project', streams: 50 },
        ]
        ;(mockConnection.query as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockTable
        )

        type ArtistStreams = { artist: string; streams: number }
        const query = 'SELECT artist, streams FROM music_streams'
        const result = await queryDBAsJSON<ArtistStreams>(query)

        expect(mockConnection.query).toHaveBeenCalledWith(query)
        expect(result).toEqual(mockData)
    })

    it('should use a prepared statement when params are provided', async () => {
        const mockData = [
            { artist: 'Daft Punk', streams: 100 },
            { artist: 'Veridis Project', streams: 50 },
        ]
        ;(mockConnection.prepare as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockStmt
        )
        ;(mockStmt.query as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockTable
        )
        ;(mockStmt.close as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined
        )

        type ArtistStreams = { artist: string; streams: number }
        const query =
            'SELECT artist, streams FROM music_streams WHERE year(ts::date) = ?'
        const result = await queryDBAsJSON<ArtistStreams>(query, [2024])

        expect(mockConnection.prepare).toHaveBeenCalledWith(query)
        expect(mockStmt.query).toHaveBeenCalledWith(2024)
        expect(mockStmt.close).toHaveBeenCalled()
        expect(mockConnection.query).not.toHaveBeenCalled()
        expect(result).toEqual(mockData)
    })

    it('should close the prepared statement even if the query throws', async () => {
        ;(mockConnection.prepare as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockStmt
        )
        ;(mockStmt.query as ReturnType<typeof vi.fn>).mockRejectedValue(
            new Error('DuckDB error')
        )
        ;(mockStmt.close as ReturnType<typeof vi.fn>).mockResolvedValue(
            undefined
        )

        await expect(
            queryDBAsJSON('SELECT * FROM t WHERE year(ts::date) = ?', [2024])
        ).rejects.toThrow('DuckDB error')

        expect(mockStmt.close).toHaveBeenCalled()
    })
})
