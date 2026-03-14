with track_yearly_play_counts as (
    select
        year(ts::datetime)::int as year,
        track_name,
        artist_name,
        count(*)::int as play_count
    from ${table}
    where track_name is not null
    group by year, track_name, artist_name
),

track_total_play_counts as (
    select
        track_name,
        artist_name,
        sum(play_count)::int as total_play_count
    from track_yearly_play_counts
    group by track_name, artist_name
),

top_10_global_tracks as (
    select
        track_name,
        artist_name
    from track_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        year,
        track_name,
        artist_name,
        play_count,
        row_number()
            over (partition by year order by play_count desc)
        ::int as rank
    from track_yearly_play_counts
)

select
    yr.year,
    yr.track_name as track,
    yr.artist_name as artist,
    yr.rank,
    yr.play_count
from yearly_ranks as yr
inner join
    top_10_global_tracks
on yr.track_name = top_10_global_tracks.track_name
and yr.artist_name = top_10_global_tracks.artist_name
order by yr.year, yr.rank
