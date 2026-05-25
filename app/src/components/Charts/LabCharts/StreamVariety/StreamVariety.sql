with spine as (
    select ${spineTimeTrunc} as ts
    from generate_series(${spineStart}, ${spineEnd}, ${step}) as t (dt)
),

stream_agg as (
    select
        ${streamTimeTrunc} as ts,
        count(distinct ${entity_column}) as distinct_count,
        count(*) - count(distinct ${entity_column}) as repeat_count,
        count(*) as total_count
    from ${table}
    where ${year_condition}
    group by ${streamTimeTrunc}
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.distinct_count, 0)::int as distinct_count,
    coalesce(stream_agg.repeat_count, 0)::int as repeat_count,
    coalesce(stream_agg.total_count, 0)::int as total_count
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
