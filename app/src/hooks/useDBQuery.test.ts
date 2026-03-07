import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDBQueryFirst, useDBQueryMany } from './useDBQuery'
import * as queryDB from '../db/queries/queryDB'

type User = { id: number; name?: string; year?: number }

describe('useDBQueryMany', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should start loading initially', () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue([])

        const { result } = renderHook(() =>
            useDBQueryMany<User>({
                query: 'SELECT 1',
            })
        )

        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(true)
        expect(result.current.error).toBeUndefined()
    })

    it('should fetch and return rows', async () => {
        const mockData: User[] = [{ id: 1, name: 'test' }]
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue(mockData)

        const { result } = renderHook(() =>
            useDBQueryMany<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.data).toEqual(mockData)
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
        expect(queryDB.queryDBAsJSON).toHaveBeenCalledWith('SELECT * FROM test')
    })

    it('should return empty array when DB returns empty', async () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue([])

        const { result } = renderHook(() =>
            useDBQueryMany<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.data).toEqual([])
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
    })

    it('should handle errors', async () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB error')
        )

        const { result } = renderHook(() =>
            useDBQueryMany<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('DB error')
    })
})

describe('useDBQueryFirst', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return first row', async () => {
        const mockData: User[] = [{ id: 1 }, { id: 2 }, { id: 3 }]
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue(mockData)

        const { result } = renderHook(() =>
            useDBQueryFirst<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.data).toEqual({ id: 1 })
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
    })

    it('should return undefined when DB returns empty', async () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue([])

        const { result } = renderHook(() =>
            useDBQueryFirst<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeUndefined()
    })

    it('should handle errors', async () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB error')
        )

        const { result } = renderHook(() =>
            useDBQueryFirst<User>({
                query: 'SELECT * FROM test',
            })
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeUndefined()
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.error?.message).toBe('DB error')
    })
})

describe('shared behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should refetch when year changes', async () => {
        const firstMock: User[] = [{ id: 1, year: 2024 }]
        const secondMock: User[] = [{ id: 2, year: 2025 }]

        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockResolvedValueOnce(firstMock).mockResolvedValueOnce(secondMock)

        const { result, rerender } = renderHook(
            ({ year }: { year: number }) =>
                useDBQueryMany<User>({
                    query: `SELECT * FROM test WHERE year = ${year}`,
                    year,
                }),
            { initialProps: { year: 2024 } }
        )

        await waitFor(() => {
            expect(result.current.data).toEqual(firstMock)
        })

        rerender({ year: 2025 })

        await waitFor(() => {
            expect(result.current.data).toEqual(secondMock)
        })

        expect(spy).toHaveBeenCalledTimes(2)
    })
})
