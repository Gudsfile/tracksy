export interface StreamRecord {
    spotify_track_uri: string | null | undefined
    [key: string]: unknown
}

export function extractMusicOnly(
    streamRecordsPerFile: StreamRecord[]
): StreamRecord[] {
    return streamRecordsPerFile.filter(
        (record) => record.spotify_track_uri != null
    )
}
