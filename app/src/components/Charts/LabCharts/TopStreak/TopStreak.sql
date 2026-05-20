with dates as (
    select distinct ts::date as stream_date
    from ${table}
),

streak_groups as (
    select
        stream_date,
        stream_date
        - (row_number() over (order by stream_date) - 1)::int as grp
    from dates
)

select
    count(*)::integer as streaks,
    min(stream_date) as start_ts,
    max(stream_date) as end_ts
from streak_groups
group by grp
order by ${order_condition}
limit 1
