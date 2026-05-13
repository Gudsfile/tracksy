select
    year(ts::date)::integer as stream_year,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from ${table}
group by year(ts::date)
order by year(ts::date)
