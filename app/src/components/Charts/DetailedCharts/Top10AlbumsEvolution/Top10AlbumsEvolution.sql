with
max_date as (
    select max(ts::date) as last_date
    from ${table}
),

album_listening as (
    select
        album_name,
        artist_name,
        year(ts::date)::int as year,
        count(*) as playing_days_count
    from ${table}, max_date
    group by album_name, artist_name, ts::date
    -- arbitrary threshold: an album listen is counted from 7 distinct tracks
    -- conservative lower bound of average album length
    having count(distinct track_name) >= 7
),

album_yearly_play_counts as (
    select
        year,
        album_name as album,
        artist_name as artist,
        count(*)::int as play_count
    from album_listening
    group by year, album_name, artist_name
),

album_total_play_counts as (
    select
        album,
        artist,
        sum(play_count)::int as total_play_count
    from album_yearly_play_counts
    group by album, artist
),

top_10_global_albums as (
    select
        album,
        artist
    from album_total_play_counts
    order by total_play_count desc
    limit 10
),

yearly_ranks as (
    select
        year,
        album,
        artist,
        play_count,
        row_number()
            over (partition by year order by play_count desc)
        ::int as rank
    from album_yearly_play_counts
)

select
    yr.year,
    yr.album,
    yr.artist,
    yr.rank,
    yr.play_count
from yearly_ranks as yr
inner join top_10_global_albums using (artist, album)
order by yr.year, yr.rank
