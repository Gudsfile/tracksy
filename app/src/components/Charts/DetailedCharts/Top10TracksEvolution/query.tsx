import { TABLE } from '../../../../db/queries/constants'

export function queryTop10TracksEvolution() {
    return `
WITH track_yearly_play_counts AS (
    SELECT
        YEAR(ts::DATETIME)::INT AS year,
        track_name,
        artist_name,
        COUNT(*)::INT AS play_count
    FROM ${TABLE}
    WHERE track_name IS NOT NULL
    GROUP BY year, track_name, artist_name
),
track_total_play_counts AS (
    SELECT
        track_name,
        artist_name,
        SUM(play_count)::INT AS total_play_count
    FROM track_yearly_play_counts
    GROUP BY track_name, artist_name
),
top_10_global_tracks AS (
    SELECT
        track_name,
        artist_name
    FROM track_total_play_counts
    ORDER BY total_play_count DESC
    LIMIT 10
),
yearly_ranks AS (
    SELECT
        year,
        track_name,
        artist_name,
        play_count,
        ROW_NUMBER() OVER (PARTITION BY year ORDER BY play_count DESC)::INT AS rank
    FROM track_yearly_play_counts
)
SELECT
    yr.year,
    track_name as track,
    artist_name as artist,
    yr.rank,
    yr.play_count
FROM yearly_ranks yr
JOIN top_10_global_tracks t10 using(track_name, artist_name)
ORDER BY yr.year, yr.rank
`
}

export type Top10TracksEvolutionQueryResult = {
    year: number
    track: string
    artist: string
    rank: number
    play_count: number
}
