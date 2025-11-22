import { TABLE } from '../../../db/queries/constants'

export function queryTop10Evolution() {
    return `
WITH artist_yearly_play_counts AS (
    SELECT
        YEAR(ts::DATETIME)::INT AS year,
        master_metadata_album_artist_name AS artist,
        COUNT(*)::INT AS play_count
    FROM ${TABLE}
    WHERE master_metadata_album_artist_name IS NOT NULL
    GROUP BY year, artist
),
artist_total_play_counts AS (
    SELECT
        artist,
        SUM(play_count)::INT AS total_play_count
    FROM artist_yearly_play_counts
    GROUP BY artist
),
top_10_global_artists AS (
    SELECT
        artist
    FROM artist_total_play_counts
    ORDER BY total_play_count DESC
    LIMIT 10
),
yearly_ranks AS (
    SELECT
        year,
        artist,
        play_count,
        ROW_NUMBER() OVER (PARTITION BY year ORDER BY play_count DESC)::INT AS rank
    FROM artist_yearly_play_counts
)
SELECT
    yr.year,
    yr.artist,
    yr.rank,
    yr.play_count
FROM yearly_ranks yr
JOIN top_10_global_artists t10 ON yr.artist = t10.artist
ORDER BY yr.year, yr.rank
`
}

export type Top10EvolutionQueryResult = {
    year: number
    artist: string
    rank: number
    play_count: number
}
