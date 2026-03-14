with ordered_streams as (
    select
        track_uri,
        track_name,
        ts,
        lag(track_uri) over (order by ts) as prev_track
    from ${table}
    where
        track_uri is not null
        and year(ts::date) = ${year}
),

repeat_groups as (
    select
        track_uri,
        track_name,
        ts,
        case when track_uri = prev_track then 0 else 1 end as is_new_group
    from ordered_streams
),

group_ids as (
    select
        *,
        sum(is_new_group) over (order by ts) as group_id
    from repeat_groups
),

group_sizes as (
    select
        group_id,
        track_uri,
        track_name,
        count(*) as repeat_count
    from group_ids
    group by group_id, track_uri, track_name
    having count(*) > 1
)

select
    count(*)::double as total_repeat_sequences,
    coalesce(max(repeat_count)::double, 0) as max_consecutive,
    coalesce(
        (select track_name from group_sizes order by repeat_count desc limit 1),
        ''
    ) as most_repeated_track,
    coalesce(avg(repeat_count)::double, 0) as avg_repeat_length
from group_sizes
