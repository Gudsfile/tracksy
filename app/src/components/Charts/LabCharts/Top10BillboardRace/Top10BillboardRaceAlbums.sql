select
    album_name as entity_name,
    date_trunc('week', ts::datetime)::date as period_start,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from ${table}
where album_name is not null
${yearFilter}
group by period_start, period_ts, entity_name
order by period_ts asc
