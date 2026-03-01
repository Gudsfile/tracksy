import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'

export async function insertUrlInDatabase(jsonUrl: URL) {
    const { conn } = await getDB()
    await conn.query(DROP_TABLE_QUERY)
    await conn.insertJSONFromPath(jsonUrl.toString(), { name: TABLE })
    // The Spotify track URI is renamed to track_uri to match the `StreamRecord` model.
    // `insertUrlInDatabase` is only used by the `DemoButton`, which provides a Spotify file.
    // It's acceptable to apply this transformation here as a temporary hotfix, but ideally,
    // we should use the transformation from `SpotifyStreamProvider` and automatically detect
    // the correct provider to use.
    await conn.query(
        `ALTER TABLE ${TABLE} RENAME COLUMN spotify_track_uri TO track_uri`
    )
}
