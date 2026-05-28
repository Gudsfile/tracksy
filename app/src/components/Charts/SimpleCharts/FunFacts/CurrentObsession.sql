with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
)

select
    t.track_name as entity,
    count(*)::integer as metric
from ${table} as t, recent_date
where
    t.ts::date >= recent_date.max_date - interval 30 day
    and t.track_name is not null
group by t.track_name
order by metric desc
limit 1
