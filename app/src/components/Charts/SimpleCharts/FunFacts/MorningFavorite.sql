select
    artist_name as main_text,
    'morning_favorite' as fact_type,
    count(*) as fact_value,
    'streams' as unit,
    'between 6am and 12pm' as context
from ${table}
where
    (hour(ts::datetime) >= 6 and hour(ts::datetime) < 12)
    and artist_name is not null
group by artist_name
order by fact_value desc
limit 1
