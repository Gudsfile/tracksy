with all_months as (
    select last_day(month_start) as ts
    from generate_series(
        (
            select date_trunc('year', min(ts::date))
            from ${table}
            where ${year_condition}
        ),
        (
            select
                date_trunc('year', max(ts::date))
                + interval '1 year'
                - interval '1 day'
            from ${table}
            where ${year_condition}
        ),
        interval 1 month
    ) as t (month_start)
),

monthly_streams as (
    select
        last_day(ts::date) as ts,
        sum(ms_played) as ms_played,
        count(*) as count_streams
    from ${table}
    where ${year_condition}
    group by last_day(ts::date)
)

select
    coalesce(monthly_streams.count_streams, 0)::int as count_streams,
    make_date(year(all_months.ts), month(all_months.ts), 1) as ts,
    coalesce(monthly_streams.ms_played, 0) as ms_played
from all_months
left join monthly_streams on all_months.ts = monthly_streams.ts
order by all_months.ts
