with
recent_date as (
    select max(ts::date) as max_date
    from ${table}
),

threshold as (
    select approx_quantile(total_streams, 0.99) as limit_streams
    from (
        select count(*) as total_streams
        from ${table}
        group by artist_name
    )
),

recent_artists as (
    select distinct t.artist_name as artist
    from ${table} as t, recent_date
    where
        t.artist_name is not null
        and t.ts::date >= recent_date.max_date - interval 90 day
),

artist_years as (
    select
        artist_name,
        min(year(ts::date)) as first_year
    from ${table}
    where
        artist_name in (select artist from recent_artists)
    group by artist_name
    having count(*) >= (select limit_streams from threshold)
    order by first_year
    limit 20
)

select
    artist_years.artist_name as main_text,
    'musical_anniversary' as fact_type,
    year(recent_date.max_date) - artist_years.first_year as fact_value,
    'years' as unit,
    'with you' as context
from artist_years, recent_date
USING SAMPLE 1
