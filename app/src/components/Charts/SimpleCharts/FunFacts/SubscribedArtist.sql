select
    artist_name as entity,
    count(distinct strftime(ts::date, '%Y-%m'))::integer as metric
from ${table}
where artist_name is not null
group by artist_name
order by metric desc
limit 1
