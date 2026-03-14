with
max_date as (
    select min(ts) as max_date
    from (
        select max(ts::date) as ts
        from ${table}
        union
        (select '${ year}-12-31'::date as ts)
    )
),

selected_tracks as (
    select *
    from ${table}
    where year(ts::date) = ${year}
),

date_range as (
    select count(*) as total_days
    from
        generate_series(
            '${ year}-01-01'::date,
            (select max_date from max_date),
            interval 1 day
        ) as t (d)
),

listening_days_count as (
    select count(distinct ts::date) as days_with_streams
    from selected_tracks
),

listening_days as (
    (select distinct ts::date as day from selected_tracks)
    union
    (select '${ year}-01-01'::date - 1 as day)
    union
    (select max_date + 1 as day from max_date)
),

gaps as (
    select date_diff('day', lag(day) over (order by day), day) - 1 as gap
    from listening_days
),

max_gap as (
    select max(gap) as longest_pause_days
    from gaps
)

select
    listening_days_count.days_with_streams::double as days_with_streams,
    date_range.total_days::double as total_days,
    coalesce(max_gap.longest_pause_days, 0)::double as longest_pause_days
from listening_days_count, date_range, max_gap
