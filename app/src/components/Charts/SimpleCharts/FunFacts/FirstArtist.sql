select
    artist_name as entity,
    min(year(ts::date))::integer as metric
from ${table}
where artist_name is not null
group by artist_name
order by metric asc
limit 1
