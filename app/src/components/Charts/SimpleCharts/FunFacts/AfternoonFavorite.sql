select
    artist_name as main_text,
    'afternoon_favorite' as fact_type,
    count(*) as fact_value,
    'streams' as unit,
    'between 12pm and 6pm' as context
from ${table}
where
    (hour(ts::datetime) >= 12 and hour(ts::datetime) < 18)
    and artist_name is not null
group by artist_name
order by fact_value desc
limit 1
