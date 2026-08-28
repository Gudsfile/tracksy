export interface AppleMusicRawRecord {
    'Song Name': unknown
    'Album Name': unknown
    'Container Artist Name': unknown // always null
    'Media Type': unknown // "AUDIO" | "VIDEO" | ...
    'Event Start Timestamp': unknown // TIMESTAMP WITH TIME ZONE — read as raw varchar (all_varchar=true)
    // to preserve the original UTC offset, e.g. "2024-01-15T22:00:00-05:00".
    // Without all_varchar, DuckDB auto-detects TIMESTAMPTZ and Arrow returns a
    // Date/BigInt whose offset is already lost.
    'Play Duration Milliseconds': unknown // can be negative
    'Device Type': unknown
    'Container Origin Type': unknown
    [key: string]: unknown
}
