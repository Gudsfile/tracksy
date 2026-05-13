select
    artist_name as main_text,
    'first_artist' as fact_type,
    min(year(ts::date)) as fact_value,
    'Do you still listen to it?' as context
from ${table}
where artist_name is not null
group by artist_name
order by fact_value asc
limit 1
