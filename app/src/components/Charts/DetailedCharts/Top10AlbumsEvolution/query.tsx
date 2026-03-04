import { TABLE } from '../../../../db/queries/constants'

export function queryTop10AlbumsEvolution() {
    return `
WITH
max_date AS (
    SELECT MAX(ts::DATE) AS last_date
    FROM ${TABLE}
),
album_listening AS (
  SELECT
      album_name,
      artist_name,
      YEAR(ts::DATE)::INT as year,
      COUNT(*) AS playing_days_count
  FROM ${TABLE}, max_date
  GROUP BY album_name, artist_name, ts::DATE
  HAVING COUNT(DISTINCT track_name) >= 7
),
album_yearly_play_counts AS (
    SELECT
        year,
        album_name AS album,
        artist_name AS artist,
        COUNT(*)::INT AS play_count
    FROM album_listening
    GROUP BY year, album_name, artist_name
),
album_total_play_counts AS (
    SELECT
        album,
        artist,
        SUM(play_count)::INT AS total_play_count
    FROM album_yearly_play_counts
    GROUP BY album, artist
),
top_10_global_albums AS (
    SELECT
        album,
        artist
    FROM album_total_play_counts
    ORDER BY total_play_count DESC
    LIMIT 10
),
yearly_ranks AS (
    SELECT
        year,
        album,
        artist,
        play_count,
        ROW_NUMBER() OVER (PARTITION BY year ORDER BY play_count DESC)::INT AS rank
    FROM album_yearly_play_counts
)
SELECT
    yr.year,
    yr.album,
    yr.artist,
    yr.rank,
    yr.play_count
FROM yearly_ranks yr
JOIN top_10_global_albums t10 ON yr.artist = t10.artist and yr.album=t10.album
ORDER BY yr.year, yr.rank
`
}

export type Top10AlbumsEvolutionQueryResult = {
    year: number
    album: string
    artist: string
    rank: number
    play_count: number
}
