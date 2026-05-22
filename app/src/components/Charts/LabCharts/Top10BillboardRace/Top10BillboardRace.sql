select
    date_trunc('week', ts::datetime)::date as period_start,
    artist_name as label,
    count(*)::int as period_plays,
    epoch(date_trunc('week', ts::datetime)::date) * 1000 as period_ts
from ${table}
where artist_name is not null
${yearFilter}
group by period_start, period_ts, label
order by period_ts asc
