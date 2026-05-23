export interface AppleMusicRawRecord {
    'Song Name': unknown
    'Album Name': unknown
    'Container Artist Name': unknown // always null
    'Media Type': unknown // "AUDIO" | "VIDEO" | ...
    'Event Start Timestamp': unknown // TIMESTAMP WITH TIME ZONE — Arrow returns Date or BigInt
    'Play Duration Milliseconds': unknown // can be negative
    'Device Type': unknown
    'Container Origin Type': unknown
    [key: string]: unknown
}
