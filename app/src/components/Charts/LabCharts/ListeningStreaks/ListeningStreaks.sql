select distinct ts::date::text as stream_date
from ${table}
where ${year_condition}
order by stream_date
