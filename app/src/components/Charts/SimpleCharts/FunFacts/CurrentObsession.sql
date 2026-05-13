with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
)

select
    track_name as main_text,
    count(*)::integer as fact_value,
    'current_obsession' as fact_type,
    'streams' as unit,
    'in the last 30 days' as context
from ${table}, recent_date
where
    ts::date >= max_date - interval 30 day
    and track_name is not null
group by track_name
order by fact_value desc
limit 1
