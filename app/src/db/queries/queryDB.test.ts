import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import * as db from '../getDB'
import { queryDBAsJSON } from './queryDB'

describe('queryDBAsJSON', () => {
    const mockConnection = {
        query: vi.fn(),
    } as unknown as AsyncDuckDBConnection

    beforeEach(() => {
        vi.spyOn(db, 'getDB').mockResolvedValue({
            conn: mockConnection,
            db: {} as unknown as AsyncDuckDB,
        })
        vi.clearAllMocks()
    })

    it('should execute a query and return a JSON array', async () => {
        const mockData = [
            { artist: 'Daft Punk', streams: 100 },
            { artist: 'Veridis Project', streams: 50 },
        ]

        const mockTable = {
            toArray: () => mockData.map((row) => ({ toJSON: () => row })),
        }
        ;(mockConnection.query as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockTable
        )

        type ArtistStreams = {
            artist: string
            streams: number
        }
        const query = 'SELECT artist, streams FROM spotitable'
        const result = await queryDBAsJSON<ArtistStreams>(query)

        expect(mockConnection.query).toHaveBeenCalledWith(query)
        expect(result).toEqual(mockData)
    })
})
