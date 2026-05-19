select
    artist_name as main_text,
    count(distinct strftime(ts::date, '%Y-%m'))::integer as fact_value,
    'months' as unit,
    'of presence' as context
from ${table}
where artist_name is not null
group by artist_name
order by fact_value desc
limit 1
