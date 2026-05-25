with spine as (
    select ${spineTimeTrunc} as ts
    from generate_series(${spineStart}, ${spineEnd}, ${step}) as t (dt)
),

stream_agg as (
    select
        ${streamTimeTrunc} as ts,
        sum(ms_played) as ms_played,
        count(*) as count_streams
    from ${table}
    where ${year_condition}
    group by ${streamTimeTrunc}
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.count_streams, 0)::int as count_streams,
    coalesce(stream_agg.ms_played, 0) as ms_played
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
