select
    artist_name as main_text,
    'evening_favorite' as fact_type,
    count(*) as value,
    'streams' as unit,
    'between 6pm and 0am' as context
from ${table}
where
    (hour(ts::datetime) >= 18 and hour(ts::datetime) < 24)
    and artist_name is not null
group by artist_name
order by value desc
limit 1
