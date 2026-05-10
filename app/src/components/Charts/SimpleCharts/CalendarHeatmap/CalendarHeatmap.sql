select
    day::varchar as day,
    stream_count::double as stream_count
from ${table}
where ${year_condition}
order by day
