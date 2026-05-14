with max_date as (
    select max(ts::date) as last_date
    from ${table}
),

sunday_album_listening as (
    select
        t.album_name,
        t.artist_name,
        sum(t.ms_played) as total_ms_played
    from ${table} as t, max_date
    where
        (
            dayofweek(t.ts::date) = 0
            or (dayofweek(t.ts::date) = 1 and hour(t.ts::datetime) <= 4)
        )
        and t.ts::date >= (max_date.last_date - interval 1 YEARS)
    group by t.album_name, t.artist_name
    having count(distinct t.track_name) >= 7
    order by total_ms_played desc
    limit 1
)

select
    'cozy_album' as fact_type,
    album_name as main_text,
    artist_name as second_text,
    'the album that wraps your Sundays in musical coziness' as context
from sunday_album_listening

union all

select
    'cozy_album' as fact_type,
    null as main_text,
    'This fun fact is unfortunately unavailable' as second_text,
    'feel like listening to an album today?' as context
where not exists (select 1 from sunday_album_listening)
