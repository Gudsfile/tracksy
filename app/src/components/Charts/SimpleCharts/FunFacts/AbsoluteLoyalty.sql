with
threshold as (
    select approx_quantile(total_streams, 0.995) as limit_streams
    from (
        select count(*) as total_streams
        from ${table}
        group by artist_name
    )
),

artist_counts as (
    select
        artist_name,
        count(*) filter (where reason_end = 'trackdone') as completed_count,
        count(*) filter (
            where reason_end in ('fwdbtn', 'click-row', 'clickrow')
        ) as skipped_count,
        count(*) as total_events
    from ${table}
    where artist_name is not null
    group by artist_name
    having count(*) >= (select limit_streams from threshold)
),

artist_loyalty as (
    select
        artist_name,
        completed_count,
        skipped_count,
        total_events,
        completed_count::double precision
        / nullif(total_events, 0) as loyalty_ratio
    from artist_counts
)

select
    artist_name as main_text,
    (loyalty_ratio * 100)::integer as value,
    'absolute_loyalty' as fact_type,
    '%' as unit,
    'of your completed ('
    || completed_count
    || ') vs skipped ('
    || skipped_count
    || ')' as context
from artist_loyalty
order by value desc
limit 1
