with
daily_streams as (
    select distinct ts::date as stream_date
    from ${table}
    order by ts::date
),

date_diffs as (
    select
        stream_date,
        lag(stream_date) over (order by stream_date) as prev_date,
        date_diff(
            'day', lag(stream_date) over (order by stream_date), stream_date
        ) as day_diff
    from daily_streams
),

streak_groups as (
    select
        stream_date,
        sum(case when day_diff = 1 or day_diff is null then 0 else 1 end)
            over (order by stream_date)
        as streak_id
    from date_diffs
),

streak_lengths as (
    select
        streak_id,
        count(*) as streak_length,
        min(stream_date) as start_date,
        max(stream_date) as end_date
    from streak_groups
    group by streak_id
)

select
    streak_length::integer as fact_value,
    'unbeatable_streak' as fact_type,
    start_date::varchar || ' - ' || end_date::varchar as main_text,
    'days in a row' as unit,
    'your longest streak' as context
from streak_lengths
order by streak_length desc
limit 1
