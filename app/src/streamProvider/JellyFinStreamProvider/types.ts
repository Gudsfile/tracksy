export interface JellyFinRawRecord {
    DateCreated: Date | string | number | bigint // DuckDB may return TIMESTAMP as Date, bigint (µs), or string
    UserId: string
    ItemId: string
    ItemType: string // "Audio" | "Movie" | "Episode" | ...
    ItemName: string
    PlaybackMethod: string
    ClientName: string
    DeviceName: string
    PlayDuration: string | number // seconds; DuckDB may return as number; can be negative (bug)
}
