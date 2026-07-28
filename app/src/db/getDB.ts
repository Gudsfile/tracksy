import {
    type DuckdbApp,
    type DuckdbInitProgress,
    type DuckdbInitProgressHandler,
    setupDuckdb,
} from './setupDB'

declare global {
    interface Window {
        db: DuckdbApp['db']
        conn: DuckdbApp['conn']
    }
}
/**
 * The boot in flight, so overlapping callers share one engine instead of each
 * starting a worker and downloading the ~33 MB bundle again. Caching the value
 * alone isn't enough: it is only written once `setupDuckdb` resolves, leaving
 * every caller that arrives before then to boot its own.
 */
let boot: Promise<DuckdbApp> | null = null

/**
 * Everyone currently awaiting the boot, so a caller that joins one already in
 * flight still sees it advance instead of sitting on the first stage for the
 * whole ~33 MB download.
 */
const listeners = new Set<DuckdbInitProgressHandler>()

/** The most recent event, replayed to each caller as it subscribes. */
let lastProgress: DuckdbInitProgress | null = null

const startBoot = () =>
    setupDuckdb((progress) => {
        lastProgress = progress
        listeners.forEach((listener) => listener(progress))
    }).then((app) => {
        window.db = app.db
        window.conn = app.conn
        console.debug('Database initialized')
        return app
    })

/**
 * DuckDB is used on client side (browser) to query data
 * We just need to instantiate it once on the client side for a page render
 *
 * Every caller sharing the boot receives its progress. Callers that hit the
 * cache emit nothing — there is nothing left to wait for.
 */
export const getDB = async (onProgress?: DuckdbInitProgressHandler) => {
    if (window.db && window.conn) {
        return { db: window.db, conn: window.conn }
    }

    const pending = (boot ??= startBoot())

    if (onProgress) {
        listeners.add(onProgress)
        // Replay covers the caller that boots too: `setupDuckdb` reports its
        // first stage synchronously, before the line above could subscribe.
        if (lastProgress) onProgress(lastProgress)
    }

    try {
        return await pending
    } catch (error) {
        // Drop the rejected promise so a retry starts a fresh boot instead of
        // replaying this failure forever — unless someone already started one,
        // which several callers failing together would otherwise discard.
        if (boot === pending) {
            boot = null
            // Or the retry would open on the stage the failed attempt died at.
            lastProgress = null
        }
        throw error
    } finally {
        if (onProgress) listeners.delete(onProgress)
    }
}
