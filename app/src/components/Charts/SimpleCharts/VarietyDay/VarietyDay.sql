select
    cast(cast(ts as date) as varchar) as date,
    cast(count(distinct artist_name) as integer) as artist_count
from ${table}
group by cast(ts as date)
order by artist_count desc
limit 1
