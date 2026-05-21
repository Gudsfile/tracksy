WITH daily_streams AS (
    SELECT
        date_trunc('day', ts::datetime)::date AS stream_date,
        artist_name AS artist,
        count(*)::int AS daily_plays
    FROM ${table}
    WHERE artist_name IS NOT NULL
    GROUP BY stream_date, artist
)

select
    artist,
    sum(daily_plays)
        over (
            partition by artist
            order by
                stream_date asc
            rows between unbounded preceding and current row
        )
    ::int as play_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily_streams
order by stream_date_ts asc
