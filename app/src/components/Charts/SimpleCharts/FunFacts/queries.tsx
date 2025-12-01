import { TABLE } from '../../../../db/queries/constants'

export type FunFactResult = {
    factType: string
    mainText: string
    value: number | string
    unit?: string
    context?: string
}

export function queryMorningFavorite(): string {
    return `
    SELECT
      'morning_favorite' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*) as value,
      'streams' as unit,
      'between 6am and 12pm' as context
    FROM ${TABLE}
    WHERE
      (HOUR(ts::DATETIME) >= 6 AND HOUR(ts::DATETIME) < 12)
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
    `
}

export function queryAfternoonFavorite(): string {
    return `
    SELECT
      'afternoon_favorite' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*) as value,
      'streams' as unit,
      'between 12pm and 6pm' as context
    FROM ${TABLE}
    WHERE
      (HOUR(ts::DATETIME) >= 12 AND HOUR(ts::DATETIME) < 18)
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryEveningFavorite(): string {
    return `
    SELECT
      'evening_favorite' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*) as value,
      'streams' as unit,
      'between 6pm and 0am' as context
    FROM ${TABLE}
    WHERE
      (HOUR(ts::DATETIME) >= 18 AND HOUR(ts::DATETIME) < 24)
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryNightFavorite(): string {
    return `
    SELECT
      'night_favorite' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*) as value,
      'streams' as unit,
      'between 0am and 6am' as context
    FROM ${TABLE}
    WHERE
      (HOUR(ts::DATETIME) >= 24 OR HOUR(ts::DATETIME) < 6)
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryWeekendFavorite(): string {
    return `
    SELECT
      'weekend_favorite' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*) as value,
      'streams' as unit,
      'during the weekend' as context
    FROM ${TABLE}
    WHERE
      (DAYOFWEEK(ts::DATE) IN (0, 6)
      OR (DAYOFWEEK(ts::DATE) IN (5, 6) AND HOUR(ts::DATETIME) >= 18))
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryNostalgicReturn(): string {
    return `
    WITH
    recent_date AS (
      SELECT MAX(ts::DATE) as max_date FROM ${TABLE}
    ),
    recent_artists AS (
      SELECT
        master_metadata_album_artist_name as artist,
        MIN(ts::DATE) as last_listen
      FROM ${TABLE}, recent_date
      WHERE
        ts::DATE >= max_date - INTERVAL 90 DAY
        AND master_metadata_album_artist_name IS NOT NULL
      GROUP BY master_metadata_album_artist_name
    ),
    threshold AS (
      SELECT
        approx_quantile(total_streams, 0.5) AS limit_streams
      FROM (
        SELECT COUNT(*) AS total_streams FROM ${TABLE}
        GROUP BY master_metadata_album_artist_name
      )
    ),
    previous_listens AS (
      SELECT
        master_metadata_album_artist_name as artist,
        MAX(ts::DATE) as previous_listen
      FROM ${TABLE}, recent_date
      WHERE
        master_metadata_album_artist_name IS NOT NULL
        AND ts::DATE < max_date - INTERVAL 90 DAY
        AND master_metadata_album_artist_name IN (SELECT artist FROM recent_artists)
      GROUP BY master_metadata_album_artist_name
      HAVING COUNT(*) > (SELECT limit_streams FROM threshold)
    ),
    artist_gaps AS (
      SELECT
        artist,
        last_listen,
        previous_listen,
        DATE_DIFF('day', previous_listen, last_listen) as gap
      FROM recent_artists
      JOIN previous_listens USING (artist)
      ORDER BY gap DESC
      LIMIT 20
    )
    SELECT
      'nostalgic_return' as factType,
      artist as mainText,
      gap::INTEGER as value,
      'days' as unit,
      'days since last listen (' || previous_listen || ' - ' || last_listen || ')' as context
    FROM artist_gaps
    USING SAMPLE 1
  `
}

export function queryForgottenArtist(): string {
    return `
    WITH
    recent_date AS (
      SELECT MAX(ts::DATE) AS max_date
      FROM ${TABLE}
    ),
    recent_artists AS (
      SELECT DISTINCT master_metadata_album_artist_name AS artist
      FROM ${TABLE}, recent_date
      WHERE master_metadata_album_artist_name IS NOT NULL
        AND ts::DATE >= max_date - INTERVAL 90 DAY
    ),
    forgotten AS (
      SELECT
        master_metadata_album_artist_name AS artist,
        ts::DATE AS listen_date
      FROM ${TABLE}, recent_date
      WHERE master_metadata_album_artist_name IS NOT NULL
        AND ts::DATE < max_date - INTERVAL 90 DAY
        AND master_metadata_album_artist_name NOT IN (SELECT artist FROM recent_artists)
    ),
    counts AS (
      SELECT artist, COUNT(*) AS total_streams
      FROM forgotten
      GROUP BY artist
    ),
    threshold AS (
      SELECT approx_quantile(total_streams, 0.995) AS limit_streams
      FROM counts
    ),
    artist_stats AS (
      SELECT
        artist,
        COUNT(*) AS total_streams,
        MAX(listen_date) AS last_listen
      FROM forgotten
      GROUP BY artist
      HAVING COUNT(*) >= (SELECT limit_streams FROM threshold)
      ORDER BY MAX(listen_date)
      LIMIT 20
    )
    SELECT
      'forgotten_artist' AS factType,
      artist AS mainText,
      DATE_DIFF('day', last_listen, (SELECT max_date FROM recent_date))::INTEGER AS value,
      'days' AS unit,
      'without listening to artist with more than ' || (select limit_streams from threshold) || ' streams' AS context
    FROM artist_stats
    USING SAMPLE 1
  `
}

export function queryAbsoluteLoyalty(): string {
    return `
    WITH
    threshold AS (
      SELECT approx_quantile(total_streams, 0.995) AS limit_streams
      FROM (
        SELECT COUNT(*) AS total_streams FROM ${TABLE}
        GROUP BY master_metadata_album_artist_name
      )
    ),
    artist_counts AS (
      SELECT
        master_metadata_album_artist_name,
        COUNT(*) FILTER (WHERE reason_end = 'trackdone') AS completed_count,
        COUNT(*) FILTER (WHERE reason_end IN ('fwdbtn', 'click-row', 'clickrow')) AS skipped_count,
        COUNT(*) AS total_events
      FROM ${TABLE}
      WHERE master_metadata_album_artist_name IS NOT NULL
      GROUP BY master_metadata_album_artist_name
      HAVING COUNT(*) >= (SELECT limit_streams FROM threshold)
    ),
    artist_loyalty AS (
      SELECT
        master_metadata_album_artist_name,
        completed_count,
        skipped_count,
        total_events,
        completed_count::DOUBLE PRECISION / NULLIF(total_events, 0) AS loyalty_ratio
      FROM artist_counts
    )
    SELECT
      'absolute_loyalty' AS factType,
      master_metadata_album_artist_name AS mainText,
      (loyalty_ratio * 100)::INTEGER AS value,
      '%' AS unit,
      'of your completed (' || completed_count || ') vs skipped (' || skipped_count || ')' AS context
    FROM artist_loyalty
    ORDER BY value DESC
    LIMIT 1;
  `
}

export function querySubscribedArtist(): string {
    return `
    SELECT
      'subscribed_artist' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(DISTINCT strftime(ts::DATE, '%Y-%m'))::INTEGER as value,
      'months' as unit,
      'of presence' as context
    FROM ${TABLE}
    WHERE master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryMusicalAnniversary(): string {
    return `
    WITH
    recent_date AS (
      SELECT MAX(ts::DATE) as max_date FROM ${TABLE}
    ),
    threshold AS (
      SELECT approx_quantile(total_streams, 0.99) AS limit_streams
      FROM (
        SELECT COUNT(*) AS total_streams FROM ${TABLE}
        GROUP BY master_metadata_album_artist_name
      )
    ),
    recent_artists AS (
      SELECT DISTINCT master_metadata_album_artist_name AS artist
      FROM ${TABLE}, recent_date
      WHERE
        master_metadata_album_artist_name IS NOT NULL
        AND ts::DATE >= max_date - INTERVAL 90 DAY
    ),
    artist_years AS (
      SELECT
        master_metadata_album_artist_name,
        MIN(YEAR(ts::DATE)) as first_year
      FROM ${TABLE}
      WHERE
        master_metadata_album_artist_name IN (SELECT artist FROM recent_artists)
      GROUP BY master_metadata_album_artist_name
      HAVING COUNT(*) >= (SELECT limit_streams FROM threshold)
      ORDER BY first_year
      LIMIT 20
    )
    SELECT
      'musical_anniversary' as factType,
      master_metadata_album_artist_name as mainText,
      YEAR(max_date) - first_year as value,
      'years' as unit,
      'with you' as context
    FROM artist_years, recent_date
    USING SAMPLE 1
  `
}

export function queryFirstArtist(): string {
    return `
    SELECT
      'first_artist' as factType,
      master_metadata_album_artist_name as mainText,
      MIN(YEAR(ts::DATE)) as value,
      'Do you still listen to it?' as context
    FROM ${TABLE}
    WHERE master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value ASC
    LIMIT 1
  `
}

export function queryOneHitWonder(): string {
    return `
    WITH
    track_streams AS (
      SELECT
        master_metadata_album_artist_name AS artist_name,
        master_metadata_track_name AS track_name,
        COUNT(*) AS track_count,
        SUM(COUNT(*)) OVER(PARTITION BY master_metadata_album_artist_name) AS total_streams
      FROM ${TABLE}
      WHERE
        master_metadata_album_artist_name IS NOT NULL
        AND master_metadata_track_name IS NOT NULL
      GROUP BY master_metadata_album_artist_name, master_metadata_track_name
    ),
    track_stats AS (
      SELECT
        artist_name,
        track_name,
        CAST((track_count::DOUBLE / total_streams::DOUBLE * 100) AS INT) AS percentage
      FROM track_streams
      ORDER BY percentage DESC, total_streams DESC
      LIMIT 20
    )
    SELECT
      'one_hit_wonder' AS factType,
      track_name as mainText,
      percentage AS value,
      '%' as unit,
      'of total streams of ' || artist_name AS context
    FROM track_stats
    USING SAMPLE 1
  `
}

export function queryVarietyDay(): string {
    return `
    SELECT
        'variety_day' as factType,
        CAST(ts::DATE AS VARCHAR) as mainText,
        COUNT(DISTINCT master_metadata_album_artist_name)::INTEGER as value,
        'different artists' as unit,
        'record of diversity in one day' as context
    FROM ${TABLE}
    GROUP BY ts::DATE
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryPeakHour(): string {
    return `
    WITH
    hour_streams AS (
      SELECT
        HOUR(ts::DATETIME) as hour,
        COUNT(*) as stream_count,
        COUNT(*)::DOUBLE / (SELECT COUNT(*) FROM ${TABLE})::DOUBLE * 100 as pct
      FROM ${TABLE}
      GROUP BY HOUR(ts::DATETIME)
    )
    SELECT
      'peak_hour' as factType,
      CAST(hour AS VARCHAR) || 'h' as mainText,
      CAST(pct AS INT) as value,
      '%' as unit,
      'of total streams' as context
    FROM hour_streams
    ORDER BY stream_count DESC
    LIMIT 1
  `
}

export function queryBingeListener(): string {
    return `
    SELECT
      'binge_listener' as factType,
      CAST(ts::DATE AS VARCHAR) as mainText,
      (SUM(ms_played) / 3600000.0)::INTEGER as value,
      'hours of listening' as unit,
      'your record of listening time in one day' as context
    FROM ${TABLE}
    GROUP BY ts::DATE
    ORDER BY SUM(ms_played) DESC
    LIMIT 1
  `
}

export function queryCurrentObsession(): string {
    return `
    WITH
    recent_date AS (
      SELECT MAX(ts::DATE) as max_date FROM ${TABLE}
    )
    SELECT
      'current_obsession' as factType,
      master_metadata_track_name as mainText,
      COUNT(*)::INTEGER as value,
      'streams' as unit,
      'in the last 30 days' as context
    FROM ${TABLE}, recent_date
    WHERE ts::DATE >= max_date - INTERVAL 30 DAY
      AND master_metadata_track_name IS NOT NULL
    GROUP BY master_metadata_track_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryRecentDiscovery(): string {
    return `
    WITH
    recent_date AS (
      SELECT MAX(ts::DATE) as max_date FROM ${TABLE}
    ),
    artist_first_listen AS (
      SELECT
        master_metadata_album_artist_name,
        MIN(ts::DATE) as first_listen
      FROM ${TABLE}
      WHERE master_metadata_album_artist_name IS NOT NULL
      GROUP BY master_metadata_album_artist_name
    )
    SELECT
      'recent_discovery' as factType,
      master_metadata_album_artist_name as mainText,
      COUNT(*)::INTEGER as value,
      'streams' as unit,
      'discovered during the last 3 months' as context
    FROM ${TABLE}
    JOIN artist_first_listen USING(master_metadata_album_artist_name)
    WHERE first_listen >= (select max_date - INTERVAL 90 DAY from recent_date)
      AND master_metadata_album_artist_name IS NOT NULL
    GROUP BY master_metadata_album_artist_name
    ORDER BY value DESC
    LIMIT 1
  `
}

export function queryMarathon(): string {
    return `
    WITH
    ordered_streams AS (
      SELECT
        master_metadata_album_artist_name,
        ts,
        LAG(master_metadata_album_artist_name) OVER (ORDER BY ts) AS prev_artist
      FROM ${TABLE}
      WHERE master_metadata_album_artist_name IS NOT NULL
    ),
    group_ids AS (
      SELECT
        master_metadata_album_artist_name,
        ts,
        SUM(CASE WHEN master_metadata_album_artist_name = prev_artist THEN 0 ELSE 1 END) OVER (ORDER BY ts) AS group_id
      FROM ordered_streams
    ),
    group_sizes AS (
      SELECT
        master_metadata_album_artist_name,
        COUNT(*) AS stream_count,
        MIN(ts::DATE) as date
      FROM group_ids
      GROUP BY group_id, master_metadata_album_artist_name
    )
    SELECT
      'marathon' as factType,
      master_metadata_album_artist_name as mainText,
      stream_count::DOUBLE as value,
      'streams in a row' as unit,
      'on ' || CAST(date AS VARCHAR) as context
    FROM group_sizes
    ORDER BY stream_count DESC
    LIMIT 1
  `
}

export function queryUnbeatableStreak(): string {
    return `
    WITH
    daily_streams AS (
      SELECT DISTINCT ts::DATE as stream_date
      FROM ${TABLE}
      ORDER BY ts::DATE
    ),
    date_diffs AS (
      SELECT
        stream_date,
        LAG(stream_date) OVER (ORDER BY stream_date) as prev_date,
        DATE_DIFF('day', LAG(stream_date) OVER (ORDER BY stream_date), stream_date) as day_diff
      FROM daily_streams
    ),
    streak_groups AS (
      SELECT
        stream_date,
        SUM(CASE WHEN day_diff = 1 OR day_diff IS NULL THEN 0 ELSE 1 END) OVER (ORDER BY stream_date) as streak_id
      FROM date_diffs
    ),
    streak_lengths AS (
      SELECT
        streak_id,
        COUNT(*) as streak_length,
        MIN(stream_date) as start_date,
        MAX(stream_date) as end_date
      FROM streak_groups
      GROUP BY streak_id
    )
    SELECT
      'unbeatable_streak' as factType,
      CAST(start_date AS VARCHAR) || ' - ' || CAST(end_date AS VARCHAR) as mainText,
      streak_length::INTEGER as value,
      'days in a row' as unit,
      'your longest streak' as context
    FROM streak_lengths
    ORDER BY streak_length DESC
    LIMIT 1
  `
}

export function queryTrackProposition(): string {
    return `
    SELECT
      'track_proposition' as factType,
      master_metadata_track_name as mainText,
      'by ' || master_metadata_album_artist_name as value
    FROM ${TABLE}
    WHERE master_metadata_track_name IS NOT NULL
    USING SAMPLE 1
  `
}
