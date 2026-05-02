import { DuckDBConnection, type DuckDBValue, type Json } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'

export type TestStreamEntry = {
    ts?: string
    track_uri?: string
    track_name?: string
    artist_name?: string
    album_name?: string
    ms_played?: number
    reason_end?: string
    platform?: string
}

export async function createTestConnection(): Promise<DuckDBConnection> {
    return await DuckDBConnection.create()
}

export async function createTestTable(
    conn: DuckDBConnection,
    data: TestStreamEntry[]
): Promise<void> {
    await conn.run(`
        CREATE OR REPLACE TABLE ${TABLE} (
            ts VARCHAR,
            track_uri TEXT,
            track_name TEXT,
            artist_name TEXT,
            album_name TEXT,
            ms_played INTEGER,
            reason_end TEXT,
            platform TEXT
        )
    `)

    const appender = await conn.createAppender(TABLE)

    for (const entry of data) {
        if (entry.ts) appender.appendVarchar(entry.ts)
        else appender.appendNull()

        if (entry.track_uri) appender.appendVarchar(entry.track_uri)
        else appender.appendNull()

        if (entry.track_name) appender.appendVarchar(entry.track_name)
        else appender.appendNull()

        if (entry.artist_name) appender.appendVarchar(entry.artist_name)
        else appender.appendNull()

        if (entry.album_name) appender.appendVarchar(entry.album_name)
        else appender.appendNull()

        if (entry.ms_played) appender.appendInteger(entry.ms_played)
        else appender.appendNull()

        if (entry.reason_end) appender.appendVarchar(entry.reason_end)
        else appender.appendNull()

        if (entry.platform) appender.appendVarchar(entry.platform)
        else appender.appendNull()

        appender.endRow()
    }

    appender.closeSync()
}

export type QueryInput = string | { sql: string; params: unknown[] }

export async function testQuery(
    conn: DuckDBConnection,
    query: QueryInput
): Promise<Record<string, Json>[]> {
    if (typeof query === 'string') {
        const result = await conn.runAndReadAll(query)
        return result.getRowObjectsJson()
    }
    const stmt = await conn.prepare(query.sql)
    stmt.bind(query.params as DuckDBValue[])
    const result = await stmt.runAndReadAll()
    return result.getRowObjectsJson()
}

export async function runQueryAndReadAll(
    conn: DuckDBConnection,
    query: QueryInput
) {
    if (typeof query === 'string') {
        return conn.runAndReadAll(query)
    }
    return conn.runAndReadAll(
        query.sql,
        query.params.length > 0 ? (query.params as DuckDBValue[]) : undefined
    )
}

export function closeTestConnection(conn: DuckDBConnection): void {
    conn.closeSync()
}
