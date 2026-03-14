select
    day,
    1 as played
from (select distinct ts::date::text as day from ${table})
