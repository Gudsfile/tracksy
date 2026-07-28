import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'

export type DuckdbApp = {
    db: duckdb.AsyncDuckDB
    conn: duckdb.AsyncDuckDBConnection
}

/** Ordered steps of the DuckDB WASM boot sequence. */
export type DuckdbInitStage =
    'select' | 'instantiate' | 'connect' | 'extensions'

/**
 * `percent` is null whenever no byte-level progress is available: before the
 * WASM download starts, or when the response carries no content-length. UIs
 * should then show an indeterminate loader rather than a stuck bar.
 */
export type DuckdbInitProgress = {
    stage: DuckdbInitStage
    percent: number | null
}

export type DuckdbInitProgressHandler = (progress: DuckdbInitProgress) => void

// The .wasm bundle is ~33 MB, so its download dominates boot time and owns most
// of the bar. The remaining steps are near-instant once it lands.
const INSTANTIATE_START_PERCENT = 5
const INSTANTIATE_PERCENT_SPAN = 80
const CONNECT_PERCENT = 90
const EXTENSIONS_PERCENT = 95
const COMPLETE_PERCENT = 100

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
    },
}

/**
 * Uncompressed byte size of each pinned bundle's .wasm.
 *
 * duckdb derives its own `bytesTotal` from the content-length header — the
 * *compressed* size wherever the asset is served encoded, and GitHub Pages gzips
 * .wasm — while `bytesLoaded` counts decompressed bytes off `response.body`.
 * Dividing one by the other pins the bar at 100% after ~23% of the download.
 * The bytes that actually arrive are always the uncompressed bundle, so its size
 * on disk is the only honest denominator, whatever the transport encoding.
 *
 * Pinned to the shipped files by a test in setupDB.test.ts.
 */
export const WASM_BYTES = { mvp: 39_362_651, eh: 34_242_586 } as const

const BUNDLE_BYTES = new Map([
    [duckdb_wasm, WASM_BYTES.mvp],
    [duckdb_wasm_eh, WASM_BYTES.eh],
])

/**
 * `bytesTotal` is the uncompressed size of the bundle being downloaded, not the
 * value duckdb reports — see WASM_BYTES. Pass 0 when it isn't known: the caller
 * then gets null and shows an indeterminate loader, which beats dividing by a
 * number known to be wrong.
 */
export function toInstantiatePercent(
    { bytesLoaded }: Pick<duckdb.InstantiationProgress, 'bytesLoaded'>,
    bytesTotal: number
): number | null {
    if (!bytesTotal) return null
    // Clamped in case a WASM_BYTES constant ever drifts from the shipped file.
    const ratio = Math.min(bytesLoaded / bytesTotal, 1)
    return Math.round(
        INSTANTIATE_START_PERCENT + INSTANTIATE_PERCENT_SPAN * ratio
    )
}

export async function setupDuckdb(
    onProgress?: DuckdbInitProgressHandler
): Promise<DuckdbApp> {
    onProgress?.({ stage: 'select', percent: null })
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
    const worker = new Worker(bundle.mainWorker!)

    // Once the worker exists it must be torn down on any failure below, otherwise
    // it outlives the error and a retry would stack a second one on top of it.
    try {
        const logger = new duckdb.ConsoleLogger()
        const db = new duckdb.AsyncDuckDB(logger, worker)

        // Report the stage before the download starts so the UI can name it even
        // if the first byte-progress event is slow to arrive.
        onProgress?.({ stage: 'instantiate', percent: null })
        const bundleBytes = BUNDLE_BYTES.get(bundle.mainModule) ?? 0
        let lastPercent: number | null = null
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker, (p) => {
            const percent = toInstantiatePercent(p, bundleBytes)
            // duckdb means to throttle these to one per 20ms but only advances
            // its clock on the skip branch, so in practice it fires once per
            // chunk — thousands of times for a 33 MB bundle, across at most 81
            // distinct rounded values. Emit only when the bar would move.
            if (percent === null || percent === lastPercent) return
            lastPercent = percent
            onProgress?.({ stage: 'instantiate', percent })
        })
        const sawByteProgress = lastPercent !== null

        // Without byte progress the bar never appeared, so keep it away rather
        // than popping it in at 90% for the last two near-instant steps.
        onProgress?.({
            stage: 'connect',
            percent: sawByteProgress ? CONNECT_PERCENT : null,
        })
        const conn = await db.connect()

        onProgress?.({
            stage: 'extensions',
            percent: sawByteProgress ? EXTENSIONS_PERCENT : null,
        })
        await conn.query('INSTALL excel; LOAD excel;')

        // Close the sequence at 100 rather than leaving the bar at 95 as the
        // loader unmounts.
        if (sawByteProgress) {
            onProgress?.({ stage: 'extensions', percent: COMPLETE_PERCENT })
        }

        return { db, conn }
    } catch (error) {
        worker.terminate()
        throw error
    }
}
