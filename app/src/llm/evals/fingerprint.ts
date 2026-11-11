import { queryDBAsJSON } from '../../db/queries/queryDB'
import { TABLE } from '../../db/queries/constants'

export type DatasetFingerprint = {
    /** Stable identity of the loaded data; compare across runs. */
    id: string
    rowCount: number
    firstStream: string | null
    lastStream: string | null
    artistCount: number
}

/** No data loaded — `music_streams` does not exist yet. */
export const NO_DATASET: DatasetFingerprint = {
    id: 'none',
    rowCount: 0,
    firstStream: null,
    lastStream: null,
    artistCount: 0,
}

/**
 * Identifies the dataset currently in DuckDB.
 *
 * Eval scores are only comparable across runs when the data underneath them is
 * the same. Cases avoid asserting on specific rows, but "expected rows, got
 * none" still depends on what is loaded — so each run records this, and the
 * delta view refuses to compare two runs whose fingerprints differ rather than
 * quietly reporting a regression that is really a change of dataset.
 *
 * Resolves to {@link NO_DATASET} when the table is absent, which is how the
 * runner detects that the demo data needs loading first.
 */
export async function datasetFingerprint(): Promise<DatasetFingerprint> {
    try {
        const rows = await queryDBAsJSON<{
            row_count: number
            first_stream: string | null
            last_stream: string | null
            artist_count: number
        }>(
            `SELECT COUNT(*)::INTEGER AS row_count,
                    MIN(ts)::VARCHAR AS first_stream,
                    MAX(ts)::VARCHAR AS last_stream,
                    COUNT(DISTINCT artist_name)::INTEGER AS artist_count
             FROM ${TABLE}`
        )

        const summary = rows[0]
        if (!summary || summary.row_count === 0) return NO_DATASET

        return {
            id: [
                summary.row_count,
                summary.first_stream ?? '',
                summary.last_stream ?? '',
                summary.artist_count,
            ].join('|'),
            rowCount: summary.row_count,
            firstStream: summary.first_stream,
            lastStream: summary.last_stream,
            artistCount: summary.artist_count,
        }
    } catch {
        // The table not existing is the normal "no data yet" state, not an
        // error worth surfacing — the runner turns it into a prompt to load
        // the demo dataset.
        return NO_DATASET
    }
}

export function describeFingerprint(fingerprint: DatasetFingerprint): string {
    if (fingerprint.id === NO_DATASET.id) return 'no dataset loaded'
    const span =
        fingerprint.firstStream && fingerprint.lastStream
            ? ` · ${fingerprint.firstStream.slice(0, 10)} → ${fingerprint.lastStream.slice(0, 10)}`
            : ''
    return `${fingerprint.rowCount.toLocaleString('en-US')} streams · ${fingerprint.artistCount.toLocaleString('en-US')} artists${span}`
}
