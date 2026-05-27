select
    artist_name as main_text,
    count(*) as fact_value,
    'streams' as unit,
    'on weekends' as context
from ${table}
where
    (
        dayofweek(ts::date) in (0, 6)
        or (dayofweek(ts::date) = 5 and hour(ts::datetime) >= 18)
    )
    and artist_name is not null
group by artist_name
order by fact_value desc
limit 1
