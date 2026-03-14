with artist_yearly_play_counts as (
    select
        year(ts::datetime)::int as year,
        artist_name as artist,
        count(*)::int as play_count
    from ${table}
    where artist_name is not null
    group by year, artist
),

artist_total_play_counts as (
    select
        artist,
        sum(play_count)::int as total_play_count
    from artist_yearly_play_counts
    group by artist
),

top_10_global_artists as (
    select artist
    from artist_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        year,
        artist,
        play_count,
        row_number()
            over (partition by year order by play_count desc)
        ::int as rank
    from artist_yearly_play_counts
)

select
    yr.year,
    yr.artist,
    yr.rank,
    yr.play_count
from yearly_ranks as yr
inner join top_10_global_artists as t10 on yr.artist = t10.artist
order by yr.year, yr.rank
