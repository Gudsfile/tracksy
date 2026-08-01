import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import {
    RAW_TABLE,
    TABLE,
    DAILY_STREAM_COUNTS_TABLE,
    ARTIST_FIRST_YEAR_TABLE,
    STREAM_SESSIONS_TABLE,
    SUMMARIZE_CACHE_TABLE,
} from './queries/constants'
import sqlDailyStreamCounts from './daily_stream_counts.sql?raw'
import sqlArtistFirstYear from './artist_first_year.sql?raw'
import sqlStreamSessions from './stream_sessions.sql?raw'
import sqlSummarizeCache from './summarize_cache.sql?raw'

const DERIVED_TABLES = [
    [DAILY_STREAM_COUNTS_TABLE, sqlDailyStreamCounts],
    [ARTIST_FIRST_YEAR_TABLE, sqlArtistFirstYear],
    [STREAM_SESSIONS_TABLE, sqlStreamSessions],
    [SUMMARIZE_CACHE_TABLE, sqlSummarizeCache],
] as const

type OnProgress = (stage: string, percent: number) => void

const TOTAL_STEPS = 1 + DERIVED_TABLES.length

/**
 * Builds the SQL expression that converts a raw `ts` string into a
 * timezone-adjusted timestamp for the given home timezone.
 *
 * Casting to `TIMESTAMPTZ` (rather than `TIMESTAMP`) correctly interprets any
 * UTC offset present in the raw string — e.g. Apple Music's
 * `"2024-01-15T22:00:00-05:00"` — before converting to the home timezone, so
 * the local hour the event actually happened at is preserved.
 *
 * This stays backward-compatible with the UTC `Z`-suffixed strings produced
 * by every other provider (Spotify, Deezer, JellyFin, Custom): DuckDB parses
 * `Z` as a zero offset, so `TIMESTAMPTZ AT TIME ZONE tz` yields the same
 * result as the previous `TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE tz`.
 */
export function tsConversionExpr(tz: string): string {
    return `ts::TIMESTAMPTZ AT TIME ZONE '${tz}'`
}

export async function precomputeDerivedTables(
    conn: AsyncDuckDBConnection,
    tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
    onProgress?: OnProgress
): Promise<void> {
    await conn.query(`DROP VIEW IF EXISTS ${TABLE}`)
    await conn.query(`DROP TABLE IF EXISTS ${TABLE}`)
    await conn.query(
        `CREATE TABLE ${TABLE} AS SELECT * EXCLUDE (ts), (${tsConversionExpr(tz)}) AS ts FROM ${RAW_TABLE}`
    )
    onProgress?.('Computing statistics…', Math.round((1 / TOTAL_STEPS) * 100))

    for (const [index, [name, sql]] of DERIVED_TABLES.entries()) {
        await conn.query(`DROP TABLE IF EXISTS ${name}`)
        await conn.query(
            `CREATE TABLE ${name} AS\n${sql.replaceAll('${table}', TABLE)}`
        )
        onProgress?.(
            'Computing statistics…',
            Math.round(((index + 2) / TOTAL_STEPS) * 100)
        )
    }
}
