import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import { getStoredTimezone } from './timezoneStorage'
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

export async function precomputeDerivedTables(
    conn: AsyncDuckDBConnection,
    tz: string = getStoredTimezone()
): Promise<void> {
    await conn.query(`DROP VIEW IF EXISTS ${TABLE}`)
    await conn.query(`DROP TABLE IF EXISTS ${TABLE}`)
    await conn.query(
        `CREATE TABLE ${TABLE} AS SELECT * EXCLUDE (ts), (ts::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE '${tz}') AS ts FROM ${RAW_TABLE}`
    )
    for (const [name, sql] of DERIVED_TABLES) {
        await conn.query(`DROP TABLE IF EXISTS ${name}`)
        await conn.query(
            `CREATE TABLE ${name} AS\n${sql.replaceAll('${table}', TABLE)}`
        )
    }
}
