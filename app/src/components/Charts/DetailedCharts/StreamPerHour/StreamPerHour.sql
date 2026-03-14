select
    hour::int as hour,
    coalesce(count_streams, 0)::int as count_streams,
    coalesce(ms_played, 0)::int as ms_played
from (select unnest(range(24)) as hour)
left join (
    select
        hour(ts::datetime) as hour,
        count(*) as count_streams,
        sum(ms_played) as ms_played
    from ${table}
    where ${year_condition}
    group by hour(ts::datetime)
) using (hour)
order by hour
