import { TABLE } from '../../../../db/queries/constants'

export type RepeatResult = {
    total_repeat_sequences: number
    max_consecutive: number
    most_repeated_track: string
    avg_repeat_length: number
}

export function queryRepeatBehavior(year: number): string {
    return `
    WITH ordered_streams AS (
      SELECT
        spotify_track_uri,
        master_metadata_track_name,
        ts,
        LAG(spotify_track_uri) OVER (ORDER BY ts) AS prev_track
      FROM ${TABLE}
      WHERE spotify_track_uri IS NOT NULL
      AND YEAR(ts::DATE) = ${year}
    ),
    repeat_groups AS (
      SELECT
        spotify_track_uri,
        master_metadata_track_name,
        ts,
        CASE WHEN spotify_track_uri = prev_track THEN 0 ELSE 1 END AS is_new_group
      FROM ordered_streams
    ),
    group_ids AS (
      SELECT
        *,
        SUM(is_new_group) OVER (ORDER BY ts) AS group_id
      FROM repeat_groups
    ),
    group_sizes AS (
      SELECT
        group_id,
        spotify_track_uri,
        master_metadata_track_name,
        COUNT(*) AS repeat_count
      FROM group_ids
      GROUP BY group_id, spotify_track_uri, master_metadata_track_name
      HAVING COUNT(*) > 1
    )
    SELECT
      COUNT(*)::DOUBLE AS total_repeat_sequences,
      MAX(repeat_count)::DOUBLE AS max_consecutive,
      (SELECT master_metadata_track_name FROM group_sizes ORDER BY repeat_count DESC LIMIT 1) AS most_repeated_track,
      AVG(repeat_count)::DOUBLE AS avg_repeat_length
    FROM group_sizes
  `
}
