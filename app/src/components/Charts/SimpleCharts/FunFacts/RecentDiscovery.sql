with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
),

artist_first_listen as (
    select
        artist_name,
        min(ts::date) as first_listen
    from ${table}
    where artist_name is not null
    group by artist_name
)

select
    artist_name as main_text,
    count(*)::integer as value,
    'recent_discovery' as fact_type,
    'streams' as unit,
    'discovered during the last 3 months' as context
from ${table}
inner join artist_first_listen using (artist_name)
where
    first_listen >= (select max_date - interval 90 day from recent_date)
    and artist_name is not null
group by artist_name
order by value desc
limit 1
