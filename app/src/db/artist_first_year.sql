select
    artist_name,
    min(year(ts::date))::integer as first_year
from ${table}
where
    artist_name is not null
    and ts is not null
group by artist_name
