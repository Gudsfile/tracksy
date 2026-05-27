select
    artist_name as main_text,
    min(year(ts::date)) as fact_value,
    'still in your rotation today?' as context
from ${table}
where artist_name is not null
group by artist_name
order by fact_value asc
limit 1
