select
    dayofweek(ts::date)::integer as day_of_week,
    hour(ts::datetime)::integer as hour,
    count(*)::double as count_streams
from ${table}
where ${year_condition}
group by dayofweek(ts::date), hour(ts::datetime)
order by day_of_week, hour
