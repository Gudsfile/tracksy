import { DuckDBConnection, Json } from '@duckdb/node-api'
import { TABLE } from '../../../../db/queries/constants'

export type TestStreamEntry = {
    ts?: string
    track_uri?: string
    master_metadata_track_name?: string
    master_metadata_album_artist_name?: string
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
            master_metadata_track_name TEXT,
            master_metadata_album_artist_name TEXT,
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

        if (entry.master_metadata_track_name)
            appender.appendVarchar(entry.master_metadata_track_name)
        else appender.appendNull()

        if (entry.master_metadata_album_artist_name)
            appender.appendVarchar(entry.master_metadata_album_artist_name)
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

export async function testQuery(
    conn: DuckDBConnection,
    sql: string
): Promise<Record<string, Json>[]> {
    const result = await conn.runAndReadAll(sql)
    return result.getRowObjectsJson()
}

export function closeTestConnection(conn: DuckDBConnection): void {
    conn.closeSync()
}
