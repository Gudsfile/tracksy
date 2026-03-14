with artist_first_year as (
    select
        artist_name as artist,
        min(year(ts::date)) as discovery_year
    from ${table}
    where artist_name is not null
    group by artist_name
),

yearly_discoveries as (
    select
        discovery_year as year,
        count(*) as new_artists
    from artist_first_year
    group by discovery_year
),

year_bounds as (
    select
        min(year(ts::date)) as min_year,
        max(year(ts::date)) as max_year
    from ${table}
),

all_years as (
    select year
    from year_bounds,
        generate_series(min_year, max_year) as t (year)
),

filled_years as (
    select
        all_years.year,
        coalesce(yearly_discoveries.new_artists, 0) as new_artists
    from all_years as all_years
    left join yearly_discoveries on all_years.year = yearly_discoveries.year
),

cumulative as (
    select
        year,
        new_artists,
        sum(new_artists) over (order by year) as cumulative_artists
    from filled_years
),

artist_listens as (
    select
        artist_name as artist,
        year(ts::date) as year,
        count(*) as listen_count
    from ${table}
    where artist_name is not null
    group by year(ts::date), artist_name
),

avg_listens as (
    select
        year,
        avg(listen_count) as avg_listens_per_artist
    from artist_listens
    group by year
)

select
    cumulative.year::int as year,
    cumulative.new_artists::double as new_artists,
    cumulative.cumulative_artists::double as cumulative_artists,
    coalesce(
        avg_listens.avg_listens_per_artist, 0
    )::double as avg_listens_per_artist
from cumulative
left join avg_listens on cumulative.year = avg_listens.year
order by cumulative.year
