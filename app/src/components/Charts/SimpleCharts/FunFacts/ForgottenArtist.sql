with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
),

recent_artists as (
    select distinct artist_name as artist
    from ${table}, recent_date
    where
        artist_name is not null
        and ts::date >= max_date - interval 90 day
),

forgotten as (
    select
        artist_name as artist,
        ts::date as listen_date
    from ${table}, recent_date
    where
        artist_name is not null
        and ts::date < max_date - interval 90 day
        and artist_name not in (select artist from recent_artists)
),

counts as (
    select
        artist,
        count(*) as total_streams
    from forgotten
    group by artist
),

threshold as (
    select approx_quantile(total_streams, 0.995) as limit_streams
    from counts
),

artist_stats as (
    select
        artist,
        count(*) as total_streams,
        max(listen_date) as last_listen
    from forgotten
    group by artist
    having count(*) >= (select limit_streams from threshold)
    order by max(listen_date)
    limit 20
)

select
    artist as main_text,
    date_diff(
        'day', last_listen, (select max_date from recent_date)
    )::integer as fact_value,
    'forgotten_artist' as fact_type,
    'days' as unit,
    'without listening to artist with more than '
    || (
        select limit_streams
        from threshold
    )
    || ' streams' as context
from artist_stats
USING SAMPLE 1
