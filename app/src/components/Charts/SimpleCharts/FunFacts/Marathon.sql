with
ordered_streams as (
    select
        artist_name,
        ts,
        lag(artist_name) over (order by ts) as prev_artist
    from ${table}
    where artist_name is not null
),

group_ids as (
    select
        artist_name,
        ts,
        sum(case when artist_name = prev_artist then 0 else 1 end)
            over (order by ts)
        as group_id
    from ordered_streams
),

group_sizes as (
    select
        artist_name,
        count(*) as stream_count,
        min(ts::date) as listen_date
    from group_ids
    group by group_id, artist_name
)

select
    artist_name as main_text,
    stream_count::double as fact_value,
    'marathon' as fact_type,
    'streams in a row' as unit,
    'on ' || listen_date::varchar as context
from group_sizes
order by stream_count desc
limit 1
