select
    track_name,
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from ${table}
where
    track_name is not null
    and artist_name is not null
    and year(ts::date) = ${year}
group by track_name, artist_name
order by count_streams desc
limit 5
