with monthly_aggregates as (
    select sum(ms_played) as monthly_duration
    from ${table}
    group by year(ts::date), month(ts::date)
)

select
    (
        select max(monthly_duration)::double
        from monthly_aggregates
    ) as max_monthly_duration,
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from ${table}
