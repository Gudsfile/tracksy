select
    artist_name as main_text,
    'night_favorite' as fact_type,
    count(*) as fact_value,
    'streams' as unit,
    'between 0am and 6am' as context
from ${table}
where
    hour(ts::datetime) < 6
    and artist_name is not null
group by artist_name
order by fact_value desc
limit 1
