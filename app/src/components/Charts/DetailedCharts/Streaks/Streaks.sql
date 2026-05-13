select
    stream_date,
    1 as played
from (select distinct ts::date::text as stream_date from ${table})
