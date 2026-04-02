export interface DeezerRawStreamRecord {
    'Song Title': string
    Artist: string
    ISRC: string
    'Album Title': string
    'IP Address': string
    'Listening Time': string | number // DuckDB may infer as number
    'Platform Name': string
    'Platform Model': string
    Date: string // "2024-10-24 23:00:00"
}
