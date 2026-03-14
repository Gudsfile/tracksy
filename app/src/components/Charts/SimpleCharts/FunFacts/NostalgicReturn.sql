with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
),

recent_artists as (
    select
        artist_name as artist,
        min(ts::date) as last_listen
    from ${table}, recent_date
    where
        ts::date >= max_date - interval 90 day
        and artist_name is not null
    group by artist_name
),

threshold as (
    select approx_quantile(total_streams, 0.5) as limit_streams
    from (
        select count(*) as total_streams
        from ${table}
        group by artist_name
    )
),

previous_listens as (
    select
        artist_name as artist,
        max(ts::date) as previous_listen
    from ${table}, recent_date
    where
        artist_name is not null
        and ts::date < max_date - interval 90 day
        and artist_name in (select artist from recent_artists)
    group by artist_name
    having count(*) > (select limit_streams from threshold)
),

artist_gaps as (
    select
        artist,
        last_listen,
        previous_listen,
        date_diff('day', previous_listen, last_listen) as gap
    from recent_artists
    inner join previous_listens using (artist)
    order by gap desc
    limit 20
)

select
    artist as main_text,
    gap::integer as value,
    'nostalgic_return' as fact_type,
    'days' as unit,
    'days since last listen ('
    || previous_listen
    || ' - '
    || last_listen
    || ')' as context
from artist_gaps
USING SAMPLE 1
