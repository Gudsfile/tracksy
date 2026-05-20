select
    track_name,
    artist_name,
    count(*)::double as count_streams,
    sum(ms_played)::double as ms_played
from ${table}
where ${year_condition}
group by track_uri, track_name, artist_name
order by count_streams desc, ms_played desc
limit 10
