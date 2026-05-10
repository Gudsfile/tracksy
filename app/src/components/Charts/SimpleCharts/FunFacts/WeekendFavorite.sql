select
    artist_name as main_text,
    'weekend_favorite' as fact_type,
    count(*) as value,
    'streams' as unit,
    'during the weekend' as context
from ${table}
where
    (
        dayofweek(ts::date) in (0, 6)
        or (dayofweek(ts::date) = 5 and hour(ts::datetime) >= 18)
    )
    and artist_name is not null
group by artist_name
order by value desc
limit 1
