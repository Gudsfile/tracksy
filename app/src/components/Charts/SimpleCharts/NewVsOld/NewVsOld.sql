with artist_first_listen as (
    select
        artist_name,
        min(year(ts::date)) as first_year
    from ${table}
    where artist_name is not null
    group by artist_name
),

streams_classified as (
    select
        artist_name as artist,
        case
            when artist_first_listen.first_year = ${year_for_new} then 'new'
            else 'old'
        end as category
    from ${table}
    inner join artist_first_listen using (artist_name)
    where
        ${year_condition}
        and artist_name is not null
)

select
    count(*) filter (where category = 'new')::double as new_artists_streams,
    count(*) filter (where category = 'old')::double as old_artists_streams,
    count(
        distinct case when category = 'new' then artist end
    )::double as new_artists_count,
    count(*)::double as total
from streams_classified
