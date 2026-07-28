import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDuckDBInit } from './useDuckDBInit'
import * as db from '../db/getDB'
import type { DuckdbApp } from '../db/setupDB'

type Resolved = Awaited<ReturnType<typeof db.getDB>>

const fakeDb = () => ({ db: vi.fn(), conn: vi.fn() }) as unknown as Resolved

beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
})

describe('useDuckDBInit', () => {
    it('exposes the database once initialization resolves', async () => {
        vi.spyOn(db, 'getDB').mockResolvedValue(fakeDb())

        const { result } = renderHook(() => useDuckDBInit())

        expect(result.current.db).toBe(null)
        await waitFor(() => expect(result.current.db).not.toBe(null))
        expect(result.current.error).toBe(null)
    })

    it('surfaces stage and percent reported during initialization', async () => {
        let release: (value: Resolved) => void = () => {}
        const pending = new Promise<Resolved>((resolve) => {
            release = resolve
        })
        vi.spyOn(db, 'getDB').mockImplementation((onProgress) => {
            onProgress?.({ stage: 'instantiate', percent: 42 })
            return pending
        })

        const { result } = renderHook(() => useDuckDBInit())

        await waitFor(() => expect(result.current.stage).toBe('instantiate'))
        expect(result.current.percent).toBe(42)
        expect(result.current.db).toBe(null)

        await act(async () => {
            release(fakeDb())
            await pending
        })
    })

    it('keeps percent null when no byte progress is available', async () => {
        vi.spyOn(db, 'getDB').mockImplementation((onProgress) => {
            onProgress?.({ stage: 'select', percent: null })
            return Promise.resolve(fakeDb())
        })

        const { result } = renderHook(() => useDuckDBInit())

        await waitFor(() => expect(result.current.stage).toBe('select'))
        expect(result.current.percent).toBe(null)
    })

    it('reports an error instead of hanging when initialization fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(db, 'getDB').mockRejectedValue(new Error('wasm exploded'))

        const { result } = renderHook(() => useDuckDBInit())

        await waitFor(() => expect(result.current.error).not.toBe(null))
        expect(result.current.error?.message).toBe('wasm exploded')
        expect(result.current.db).toBe(null)
    })

    it('wraps non-Error rejections', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(db, 'getDB').mockRejectedValue('just a string')

        const { result } = renderHook(() => useDuckDBInit())

        await waitFor(() => expect(result.current.error).not.toBe(null))
        expect(result.current.error?.message).toBe('just a string')
    })

    it('retries initialization and clears the previous error', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const getDB = vi
            .spyOn(db, 'getDB')
            .mockRejectedValueOnce(new Error('wasm exploded'))
            .mockResolvedValueOnce(fakeDb())

        const { result } = renderHook(() => useDuckDBInit())
        await waitFor(() => expect(result.current.error).not.toBe(null))

        act(() => result.current.retry())

        await waitFor(() => expect(result.current.db).not.toBe(null))
        expect(result.current.error).toBe(null)
        expect(getDB).toHaveBeenCalledTimes(2)
    })

    it('skips initialization when a database is supplied', () => {
        const getDB = vi.spyOn(db, 'getDB').mockResolvedValue(fakeDb())
        const initialDb = fakeDb() as unknown as DuckdbApp

        const { result } = renderHook(() => useDuckDBInit({ initialDb }))

        expect(result.current.db).toBe(initialDb)
        expect(getDB).not.toHaveBeenCalled()
    })
})
