select
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from ${table}
where artist_name is not null
group by
    artist_name
order by ${order_condition}
limit 1
