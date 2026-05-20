select
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from ${table}
where ${year_condition}
group by artist_name
order by count_streams desc
limit 10
