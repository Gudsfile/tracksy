select
    min(ts::datetime) as min_datetime,
    max(ts::datetime) as max_datetime
from ${table}
