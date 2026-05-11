import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDBQueryFirst, useDBQueryMany } from './useDBQuery'
import * as queryDB from '../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../db/dataSignal'

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

    it('should return only the first row', async () => {
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
})

describe('stale-while-revalidate', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('keeps isLoading false during refetch after initial load', async () => {
        let resolveRefetch!: (v: User[]) => void
        const refetchPromise = new Promise<User[]>((res) => {
            resolveRefetch = res
        })

        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockResolvedValueOnce([{ id: 1 }])
        spy.mockReturnValueOnce(refetchPromise)

        const { result, rerender } = renderHook(
            ({ year }: { year: number }) =>
                useDBQueryMany<User>({ query: `SELECT ${year}`, year }),
            { initialProps: { year: 2024 } }
        )

        await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))
        expect(result.current.isLoading).toBe(false)

        rerender({ year: 2025 })

        // stale data still visible, no skeleton
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([{ id: 1 }])

        resolveRefetch([{ id: 2 }])
        await waitFor(() => expect(result.current.data).toEqual([{ id: 2 }]))
        expect(result.current.isLoading).toBe(false)
    })

    it('shows skeleton on DATA_LOADED_EVENT after initial load', async () => {
        let resolveReload!: (v: User[]) => void
        const reloadPromise = new Promise<User[]>((res) => {
            resolveReload = res
        })

        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockResolvedValueOnce([{ id: 1 }])
        spy.mockReturnValueOnce(reloadPromise)

        const { result } = renderHook(() =>
            useDBQueryMany<User>({ query: 'SELECT 1' })
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))
        })

        await waitFor(() => expect(result.current.isLoading).toBe(true))

        resolveReload([{ id: 99 }])
        await waitFor(() => expect(result.current.data).toEqual([{ id: 99 }]))
        expect(result.current.isLoading).toBe(false)
    })

    it('refetches data after DATA_LOADED_EVENT', async () => {
        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockResolvedValueOnce([{ id: 1 }])
        spy.mockResolvedValueOnce([{ id: 99 }])

        const { result } = renderHook(() =>
            useDBQueryMany<User>({ query: 'SELECT 1' })
        )

        await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]))

        act(() => {
            window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))
        })

        await waitFor(() => expect(result.current.data).toEqual([{ id: 99 }]))
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

    it('should ignore stale query results when a newer query resolves first', async () => {
        const staleMock: User[] = [{ id: 1, year: 2024 }]
        const freshMock: User[] = [{ id: 2, year: 2025 }]

        let resolveStale!: (v: User[]) => void
        let resolveFresh!: (v: User[]) => void

        const stalePromise = new Promise<User[]>((res) => {
            resolveStale = res
        })
        const freshPromise = new Promise<User[]>((res) => {
            resolveFresh = res
        })

        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockReturnValueOnce(stalePromise).mockReturnValueOnce(freshPromise)

        const { result, rerender } = renderHook(
            ({ year }: { year: number }) =>
                useDBQueryMany<User>({
                    query: `SELECT * FROM test WHERE year = ${year}`,
                    year,
                }),
            { initialProps: { year: 2024 } }
        )

        // Trigger second query before first resolves
        rerender({ year: 2025 })

        // Fresh query resolves first
        resolveFresh(freshMock)
        await waitFor(() => {
            expect(result.current.data).toEqual(freshMock)
        })

        // Stale query resolves after — should be ignored
        resolveStale(staleMock)
        await waitFor(() => {
            expect(result.current.data).toEqual(freshMock)
        })
    })
})
