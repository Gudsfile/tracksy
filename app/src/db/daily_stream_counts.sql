select
    ts::date as day,
    count(*)::double as stream_count,
    sum(ms_played)::double as ms_played
from ${table}
where ts is not null
group by ts::date
order by day
