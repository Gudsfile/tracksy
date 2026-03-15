with monthly_aggregates as (
    select sum(ms_played) as monthly_duration
    from ${table}
    group by year(ts::date), month(ts::date)
),

hourly_aggregates as (
    select count(*) as count_hourly_stream
    from ${table}
    group by year(ts::date), hour(ts::datetime)
)

select
    (
        select max(count_hourly_stream)
        from hourly_aggregates
    ) as max_count_hourly_stream,
    (
        select max(monthly_duration)
        from monthly_aggregates
    ) as max_monthly_duration,
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from ${table};
