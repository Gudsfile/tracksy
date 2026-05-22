with periods as (
    select
        date_trunc('week', ts::datetime)::date as period_start,
        album_name as label,
        count(*)::int as period_plays
    from ${table}
    where album_name is not null
    ${yearFilter}
    group by period_start, label
),
ranked as (
    select
        period_start,
        label,
        rank() over (partition by period_start order by period_plays desc) as rnk
    from periods
),
top10 as (
    select period_start, label from ranked where rnk <= 10
),
cumulative as (
    select
        period_start,
        label,
        count(*) over (
            partition by label
            order by period_start
            rows between unbounded preceding and current row
        )::int as periods_in_top10
    from top10
)
select
    label,
    periods_in_top10,
    epoch(period_start) * 1000 as period_ts
from cumulative
order by period_ts asc
