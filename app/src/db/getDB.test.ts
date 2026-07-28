import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DuckdbApp, DuckdbInitProgressHandler } from './setupDB'

const fakeApp = () => ({ db: {}, conn: {} }) as unknown as DuckdbApp

/**
 * `getDB` caches the boot in module scope, so each test needs a fresh copy of
 * the module — and a clean `window`, which the cache also writes to. Both
 * imports come from the same reset registry, so the spy below is the binding
 * the fresh `getDB` calls.
 */
async function freshGetDB() {
    vi.resetModules()
    const setupDB = await import('./setupDB')
    const { getDB } = await import('./getDB')
    return { getDB, setupDuckdb: vi.spyOn(setupDB, 'setupDuckdb') }
}

type SetupDuckdbSpy = Awaited<ReturnType<typeof freshGetDB>>['setupDuckdb']

/**
 * Holds a boot open so a test can drive its progress and choose when it lands.
 * `emit` is the handler `getDB` hands down — the one it broadcasts from.
 */
function pendingBoot(setupDuckdb: SetupDuckdbSpy) {
    const boot = {
        emit: (() => {}) as DuckdbInitProgressHandler,
        release: (() => {}) as (app: DuckdbApp) => void,
    }
    setupDuckdb.mockImplementation((onProgress) => {
        boot.emit = onProgress!
        return new Promise<DuckdbApp>((resolve) => {
            boot.release = resolve
        })
    })
    return boot
}

beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    // @ts-expect-error the globals are only assigned once a boot succeeds
    delete window.db
    // @ts-expect-error idem
    delete window.conn
})

describe('getDB', () => {
    it('boots once and caches the result', async () => {
        const { getDB, setupDuckdb } = await freshGetDB()
        setupDuckdb.mockResolvedValue(fakeApp())

        const first = await getDB()
        const second = await getDB()

        expect(setupDuckdb).toHaveBeenCalledTimes(1)
        expect(second.conn).toBe(first.conn)
    })

    it('shares one boot between callers that overlap', async () => {
        // The resolved value is only cached once setupDuckdb settles, so without
        // caching the promise every caller arriving before then starts its own
        // worker and downloads the ~33 MB bundle again.
        const { getDB, setupDuckdb } = await freshGetDB()
        const boot = pendingBoot(setupDuckdb)

        const both = Promise.all([getDB(), getDB()])
        boot.release(fakeApp())
        const [first, second] = await both

        expect(setupDuckdb).toHaveBeenCalledTimes(1)
        expect(second.conn).toBe(first.conn)
    })

    it('lets a retry start a fresh boot after a failure', async () => {
        const { getDB, setupDuckdb } = await freshGetDB()
        setupDuckdb
            .mockRejectedValueOnce(new Error('wasm exploded'))
            .mockResolvedValueOnce(fakeApp())

        await expect(getDB()).rejects.toThrow('wasm exploded')
        // The rejected promise must not stay cached, or retry would replay the
        // same failure forever.
        await expect(getDB()).resolves.toHaveProperty('conn')
        expect(setupDuckdb).toHaveBeenCalledTimes(2)
    })

    it('reports the stage the boot emits before it returns', async () => {
        // setupDuckdb announces its first stage synchronously, so the booting
        // caller cannot have subscribed yet — only the replay reaches it.
        const { getDB, setupDuckdb } = await freshGetDB()
        setupDuckdb.mockImplementation((onProgress) => {
            onProgress?.({ stage: 'select', percent: null })
            return Promise.resolve(fakeApp())
        })
        const onProgress = vi.fn()

        await getDB(onProgress)

        expect(onProgress).toHaveBeenCalledWith({
            stage: 'select',
            percent: null,
        })
    })

    it('reports progress to every caller sharing the boot', async () => {
        const { getDB, setupDuckdb } = await freshGetDB()
        const boot = pendingBoot(setupDuckdb)
        const first = vi.fn()
        const second = vi.fn()

        const both = Promise.all([getDB(first), getDB(second)])
        boot.emit({ stage: 'instantiate', percent: 42 })
        boot.release(fakeApp())
        await both

        // Without this the joining caller would sit on the first stage for the
        // whole ~33 MB download.
        const event = { stage: 'instantiate', percent: 42 }
        expect(first).toHaveBeenCalledWith(event)
        expect(second).toHaveBeenCalledWith(event)
    })

    it('replays the latest stage to a caller that joins late', async () => {
        const { getDB, setupDuckdb } = await freshGetDB()
        const boot = pendingBoot(setupDuckdb)
        const late = vi.fn()

        const first = getDB(vi.fn())
        boot.emit({ stage: 'instantiate', percent: 42 })
        const second = getDB(late)

        expect(late).toHaveBeenCalledWith({ stage: 'instantiate', percent: 42 })
        boot.release(fakeApp())
        await Promise.all([first, second])
    })

    it('does not replay a failed attempt into the retry', async () => {
        const { getDB, setupDuckdb } = await freshGetDB()
        setupDuckdb
            .mockImplementationOnce((onProgress) => {
                onProgress?.({ stage: 'instantiate', percent: 42 })
                return Promise.reject(new Error('wasm exploded'))
            })
            .mockResolvedValueOnce(fakeApp())

        await expect(getDB(vi.fn())).rejects.toThrow('wasm exploded')
        const retry = vi.fn()
        await getDB(retry)

        // Otherwise the retry would open at the stage the failure died on.
        expect(retry).not.toHaveBeenCalled()
    })
})
