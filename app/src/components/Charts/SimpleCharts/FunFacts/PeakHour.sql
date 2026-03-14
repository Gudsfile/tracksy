with
hour_streams as (
    select
        hour(ts::datetime) as hour,
        count(*) as stream_count,
        count(*)::double / (select count(*) from ${table})::double * 100 as pct
    from ${table}
    group by hour(ts::datetime)
)

select
    pct::int as value,
    'peak_hour' as fact_type,
    hour::varchar || 'h' as main_text,
    '%' as unit,
    'of total streams' as context
from hour_streams
order by stream_count desc
limit 1
