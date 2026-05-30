with daily as (
    select
        ts::date as stream_date,
        dayofweek(ts::date)::integer as day_of_week,
        hour(ts::datetime)::integer as play_hour,
        count(*) as daily_count
    from ${table}
    where ${year_condition}
    group by ts::date, dayofweek(ts::date), hour(ts::datetime)
)

select
    day_of_week,
    play_hour,
    sum(daily_count) over (
        partition by day_of_week, play_hour
        order by stream_date
        rows between unbounded preceding and current row
    )::double as cumulative_count,
    epoch(stream_date) * 1000 as stream_date_ts
from daily
order by stream_date_ts, day_of_week, play_hour
