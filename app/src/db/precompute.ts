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

const OFFSET_SUFFIX = '[+-]\\d{2}:\\d{2}$'

type OnProgress = (stage: string, percent: number) => void

const TOTAL_STEPS = 1 + DERIVED_TABLES.length

export async function precomputeDerivedTables(
    conn: AsyncDuckDBConnection,
    tz: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
    onProgress?: OnProgress
): Promise<void> {
    // A ts carrying an explicit offset (e.g. Apple Music "+02:00") is already the
    // local listening time: keep its wall-clock. UTC (Z) ts are converted to tz.
    await conn.query(
        `CREATE OR REPLACE TABLE ${TABLE} AS SELECT * EXCLUDE (ts), (CASE WHEN regexp_matches(ts, '${OFFSET_SUFFIX}') THEN regexp_replace(ts, '${OFFSET_SUFFIX}', '')::TIMESTAMP ELSE ts::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${tz}' END) AS ts FROM ${RAW_TABLE}`
    )
    onProgress?.('Computing statistics…', Math.round((1 / TOTAL_STEPS) * 100))

    for (const [index, [name, sql]] of DERIVED_TABLES.entries()) {
        await conn.query(
            `CREATE OR REPLACE TABLE ${name} AS\n${sql.replaceAll('${table}', TABLE)}`
        )
        onProgress?.(
            'Computing statistics…',
            Math.round(((index + 2) / TOTAL_STEPS) * 100)
        )
    }
}
