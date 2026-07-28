import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { statSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as duckdb from '@duckdb/duckdb-wasm'

import {
    WASM_BYTES,
    toInstantiatePercent,
    setupDuckdb,
    type DuckdbInitProgress,
} from './setupDB'

const mocks = vi.hoisted(() => ({
    instantiate: vi.fn(),
    connect: vi.fn(),
    query: vi.fn(),
    terminate: vi.fn(),
}))

// The project prefers vi.spyOn, but that only works on modules Vite transforms.
// @duckdb/duckdb-wasm is an external dependency whose namespace exports are
// non-configurable — spying on them throws "Cannot redefine property". Replacing
// the module is the only way to reach setupDuckdb's failure paths.
// eslint-disable-next-line no-restricted-syntax
vi.mock('@duckdb/duckdb-wasm', () => ({
    selectBundle: vi.fn(),
    ConsoleLogger: class ConsoleLogger {},
    AsyncDuckDB: class AsyncDuckDB {
        instantiate = mocks.instantiate
        connect = mocks.connect
    },
}))

/** The size GitHub Pages reports for the gzipped eh bundle — deliberately wrong. */
const GZIPPED_CONTENT_LENGTH = 7_842_000

type ProgressCallback = (progress: duckdb.InstantiationProgress) => void

/**
 * Drives `instantiate` through the given download positions, reporting the
 * bundle's *compressed* size as duckdb does. Nothing here should divide by it.
 */
function downloadReaching(...bytesLoaded: number[]) {
    return async (
        _mainModule: string,
        _pthreadWorker: string | null,
        onProgress?: ProgressCallback
    ) => {
        const at = new Date(0)
        for (const loaded of bytesLoaded) {
            onProgress?.({
                startedAt: at,
                updatedAt: at,
                bytesTotal: GZIPPED_CONTENT_LENGTH,
                bytesLoaded: loaded,
            })
        }
    }
}

/** Resolves selectBundle to the real eh entry, so its URL matches BUNDLE_BYTES. */
function selectEhBundle() {
    vi.mocked(duckdb.selectBundle).mockImplementation(
        async (bundles: duckdb.DuckDBBundles) => ({
            ...bundles.eh!,
            pthreadWorker: null,
        })
    )
}

function captureProgress() {
    const seen: DuckdbInitProgress[] = []
    return { seen, onProgress: (next: DuckdbInitProgress) => seen.push(next) }
}

beforeEach(() => {
    // The mocks are module-level, so call counts would otherwise carry between
    // tests — and `sequence.shuffle` means the order they carry in varies.
    vi.clearAllMocks()
    vi.stubGlobal(
        'Worker',
        class Worker {
            terminate = mocks.terminate
        }
    )
    selectEhBundle()
    mocks.instantiate.mockImplementation(downloadReaching())
    mocks.connect.mockResolvedValue({ query: mocks.query })
    mocks.query.mockResolvedValue({})
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('toInstantiatePercent', () => {
    it('maps the download across the 5–85 band', () => {
        expect(toInstantiatePercent({ bytesLoaded: 0 }, 1000)).toBe(5)
        expect(toInstantiatePercent({ bytesLoaded: 500 }, 1000)).toBe(45)
        expect(toInstantiatePercent({ bytesLoaded: 1000 }, 1000)).toBe(85)
    })

    it('is indeterminate when the total is unknown', () => {
        expect(toInstantiatePercent({ bytesLoaded: 500 }, 0)).toBe(null)
    })

    it('clamps rather than overflowing if the total is understated', () => {
        expect(toInstantiatePercent({ bytesLoaded: 5000 }, 1000)).toBe(85)
    })
})

describe('WASM_BYTES', () => {
    // The constants are the progress denominator. If a duckdb bump changes a
    // bundle's size, this fails in CI instead of shipping a bar that lies.
    const require = createRequire(import.meta.url)
    const sizeOf = (bundle: string) =>
        statSync(require.resolve(`@duckdb/duckdb-wasm/dist/${bundle}`)).size

    it('matches the shipped .wasm bundles', () => {
        expect(WASM_BYTES.eh).toBe(sizeOf('duckdb-eh.wasm'))
        expect(WASM_BYTES.mvp).toBe(sizeOf('duckdb-mvp.wasm'))
    })
})

describe('setupDuckdb', () => {
    it('reports every stage through to 100%', async () => {
        mocks.instantiate.mockImplementation(
            downloadReaching(WASM_BYTES.eh / 2, WASM_BYTES.eh)
        )
        const { seen, onProgress } = captureProgress()

        await setupDuckdb(onProgress)

        expect(seen).toEqual([
            { stage: 'select', percent: null },
            { stage: 'instantiate', percent: null },
            { stage: 'instantiate', percent: 45 },
            { stage: 'instantiate', percent: 85 },
            { stage: 'connect', percent: 90 },
            { stage: 'extensions', percent: 95 },
            { stage: 'extensions', percent: 100 },
        ])
    })

    it('measures against the bundle, not the content-length duckdb reports', async () => {
        // GitHub Pages gzips .wasm, so duckdb's bytesTotal is ~4.4x too small
        // while bytesLoaded counts decompressed bytes. Dividing one by the other
        // pinned the bar at 85% a quarter of the way into the download.
        mocks.instantiate.mockImplementation(
            downloadReaching(GZIPPED_CONTENT_LENGTH + 158_000)
        )
        const { seen, onProgress } = captureProgress()

        await setupDuckdb(onProgress)

        expect(seen).toContainEqual({ stage: 'instantiate', percent: 24 })
    })

    it('emits only when the rounded percent moves', async () => {
        // duckdb fires once per chunk; most chunks do not move a 0–100 bar.
        const nudge = Math.floor(WASM_BYTES.eh / 400)
        mocks.instantiate.mockImplementation(
            downloadReaching(nudge, nudge + 1, nudge + 2, nudge * 8)
        )
        const { seen, onProgress } = captureProgress()

        await setupDuckdb(onProgress)

        expect(
            seen.filter((p) => p.stage === 'instantiate' && p.percent !== null)
        ).toEqual([
            { stage: 'instantiate', percent: 5 },
            { stage: 'instantiate', percent: 7 },
        ])
    })

    it('stays indeterminate when no byte progress arrives', async () => {
        const { seen, onProgress } = captureProgress()

        await setupDuckdb(onProgress)

        expect(seen.every((p) => p.percent === null)).toBe(true)
        expect(seen.map((p) => p.stage)).toEqual([
            'select',
            'instantiate',
            'connect',
            'extensions',
        ])
    })

    it('stays indeterminate rather than guessing for an unknown bundle', async () => {
        vi.mocked(duckdb.selectBundle).mockResolvedValue({
            mainModule: 'https://example.test/duckdb-coi.wasm',
            mainWorker: 'https://example.test/duckdb-browser-coi.worker.js',
            pthreadWorker: null,
        })
        mocks.instantiate.mockImplementation(downloadReaching(1_000_000))
        const { seen, onProgress } = captureProgress()

        await setupDuckdb(onProgress)

        expect(seen.every((p) => p.percent === null)).toBe(true)
    })

    it('terminates the worker when instantiation fails', async () => {
        mocks.instantiate.mockRejectedValue(new Error('wasm exploded'))

        await expect(setupDuckdb()).rejects.toThrow('wasm exploded')
        // Retry-safety rests on this: without it a failed attempt leaves its
        // worker running and the next attempt stacks a second one on top.
        expect(mocks.terminate).toHaveBeenCalledTimes(1)
    })

    it('terminates the worker when the setup query fails', async () => {
        mocks.query.mockRejectedValue(new Error('no excel extension'))

        await expect(setupDuckdb()).rejects.toThrow('no excel extension')
        expect(mocks.terminate).toHaveBeenCalledTimes(1)
    })

    it('returns the connected database on success', async () => {
        const conn = { query: mocks.query }
        mocks.connect.mockResolvedValue(conn)

        const app = await setupDuckdb()

        expect(app.conn).toBe(conn)
        expect(mocks.query).toHaveBeenCalledWith('INSTALL excel; LOAD excel;')
        expect(mocks.terminate).not.toHaveBeenCalled()
    })
})
