select
    stream_date::varchar as stream_date,
    stream_count::double as stream_count
from ${table}
where ${year_condition}
order by stream_date
