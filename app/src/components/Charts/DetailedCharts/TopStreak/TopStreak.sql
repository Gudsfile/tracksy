with dates as (
    select distinct ts::date as date
    from ${table}
),

groups as (
    select
        date,
        date_add(
            date, interval '-1' day * (row_number() over (order by date))
        ) as grp
    from dates
)

select
    count(*)::integer as streaks,
    min(date) as start_ts,
    max(date) as end_ts
from groups
group by grp
order by ${order_condition}
limit 1
