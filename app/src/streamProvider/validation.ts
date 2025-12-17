import { StreamRecord } from './types'

export function isValidStreamRecord(
    record: Partial<StreamRecord>
): record is StreamRecord {
    return (
        isMusicStream(record) &&
        typeof record.ts === 'string' &&
        typeof record.ms_played === 'number' &&
        typeof record.master_metadata_track_name === 'string' &&
        typeof record.master_metadata_album_artist_name === 'string'
    )
}

function isMusicStream(record: Partial<StreamRecord>): boolean {
    return typeof record.spotify_track_uri === 'string'
}

export function isLongEnoughStream(record: StreamRecord): boolean {
    return record.ms_played >= 30000
}
