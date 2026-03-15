select
    year(ts::date)::integer as year,
    count(*)::double as streams,
    sum(ms_played)::double as ms_played
from ${table}
group by year(ts::date)
order by year(ts::date)
