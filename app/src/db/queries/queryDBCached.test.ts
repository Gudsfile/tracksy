import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    queryDBCached,
    getCachedResult,
    clearQueryCache,
} from './queryDBCached'
import * as queryDB from './queryDB'
import { DATA_LOADED_EVENT } from '../dataSignal'

type Row = { id: number }

describe('queryDBCached', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        clearQueryCache()
    })

    it('runs the query on first call and caches the result', async () => {
        const spy = vi
            .spyOn(queryDB, 'queryDBAsJSON')
            .mockResolvedValue([{ id: 1 }])

        const rows = await queryDBCached<Row>('SELECT 1')
        expect(rows).toEqual([{ id: 1 }])
        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('returns the cached result on the second call without re-running the query', async () => {
        const spy = vi
            .spyOn(queryDB, 'queryDBAsJSON')
            .mockResolvedValue([{ id: 1 }])

        await queryDBCached<Row>('SELECT 1')
        await queryDBCached<Row>('SELECT 1')

        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('exposes a synchronous getter for cached results', async () => {
        vi.spyOn(queryDB, 'queryDBAsJSON').mockResolvedValue([{ id: 42 }])

        expect(getCachedResult<Row>('SELECT 1')).toBeUndefined()
        await queryDBCached<Row>('SELECT 1')
        expect(getCachedResult<Row>('SELECT 1')).toEqual([{ id: 42 }])
    })

    it('dedupes concurrent identical queries by sharing the in-flight promise', async () => {
        let resolveQuery!: (rows: Row[]) => void
        const pending = new Promise<Row[]>((res) => {
            resolveQuery = res
        })
        const spy = vi.spyOn(queryDB, 'queryDBAsJSON').mockReturnValue(pending)

        const a = queryDBCached<Row>('SELECT 1')
        const b = queryDBCached<Row>('SELECT 1')

        expect(spy).toHaveBeenCalledTimes(1)

        resolveQuery([{ id: 7 }])
        await expect(a).resolves.toEqual([{ id: 7 }])
        await expect(b).resolves.toEqual([{ id: 7 }])
    })

    it('does not cache errors, retries on the next call', async () => {
        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockRejectedValueOnce(new Error('boom'))
        spy.mockResolvedValueOnce([{ id: 1 }])

        await expect(queryDBCached<Row>('SELECT 1')).rejects.toThrow('boom')
        await expect(queryDBCached<Row>('SELECT 1')).resolves.toEqual([
            { id: 1 },
        ])
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('clears the cache on DATA_LOADED_EVENT', async () => {
        const spy = vi
            .spyOn(queryDB, 'queryDBAsJSON')
            .mockResolvedValue([{ id: 1 }])

        await queryDBCached<Row>('SELECT 1')
        expect(getCachedResult<Row>('SELECT 1')).toBeDefined()

        window.dispatchEvent(new CustomEvent(DATA_LOADED_EVENT))

        expect(getCachedResult<Row>('SELECT 1')).toBeUndefined()
        await queryDBCached<Row>('SELECT 1')
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('caches by SQL string, distinct queries are stored separately', async () => {
        const spy = vi.spyOn(queryDB, 'queryDBAsJSON')
        spy.mockResolvedValueOnce([{ id: 2024 }])
        spy.mockResolvedValueOnce([{ id: 2025 }])

        const a = await queryDBCached<Row>('SELECT 2024')
        const b = await queryDBCached<Row>('SELECT 2025')

        expect(a).toEqual([{ id: 2024 }])
        expect(b).toEqual([{ id: 2025 }])
        expect(spy).toHaveBeenCalledTimes(2)

        await queryDBCached<Row>('SELECT 2024')
        await queryDBCached<Row>('SELECT 2025')
        expect(spy).toHaveBeenCalledTimes(2)
    })
})
