// all_varchar=true in read_csv means every column arrives as string | null;
// field types are narrowed in transform()
export interface CustomRawRecord {
    ts: unknown
    track_name: unknown
    artist_name: unknown
    album_name: unknown
    ms_played: unknown
    track_uri: unknown
    platform: unknown
    [key: string]: unknown
}
