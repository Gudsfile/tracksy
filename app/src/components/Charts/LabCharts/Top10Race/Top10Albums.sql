with daily_streams as (
    select
        date_trunc('day', ts::datetime)::date as stream_date,
        album_name as label,
        count(*)::int as daily_plays
    from ${table}
    where album_name is not null
    ${yearFilter}
    GROUP BY stream_date, label
)

select
    label,
    sum(daily_plays) over (
        partition by label
        order by stream_date asc
        rows between unbounded preceding and current row
    )::int as play_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily_streams
order by stream_date_ts asc
