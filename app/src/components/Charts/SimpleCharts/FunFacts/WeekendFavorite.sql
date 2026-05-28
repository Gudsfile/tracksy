select
    artist_name as entity,
    count(*)::integer as metric
from ${table}
where
    (
        dayofweek(ts::date) in (0, 6)
        or (dayofweek(ts::date) = 5 and hour(ts::datetime) >= 18)
    )
    and artist_name is not null
group by artist_name
order by metric desc
limit 1
