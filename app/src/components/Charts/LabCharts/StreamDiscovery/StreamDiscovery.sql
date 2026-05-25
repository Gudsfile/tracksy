with first_listen as (
    select
        ${entity_column},
        min(ts::date) as first_date
    from ${table}
    group by ${entity_column}
),

spine as (
    select ${spineTimeTrunc} as ts
    from generate_series(${spineStart}, ${spineEnd}, ${step}) as t (dt)
),

joined as (
    select
        s.${entity_column} as entity,
        s.ts::date as stream_date,
        f.first_date
    from ${table} as s
    inner join first_listen as f on s.${entity_column} = f.${entity_column}
    where ${year_condition}
),

tagged as (
    select
        ${streamTimeTrunc} as period,
        case
            when ${firstDateTrunc} = ${streamTimeTrunc}
                then entity
        end as new_entity,
        entity
    from joined
),

stream_agg as (
    select
        period as ts,
        count(distinct new_entity) as new_count,
        count(distinct entity)
        - count(distinct new_entity) as known_count,
        count(distinct entity) as total_count
    from tagged
    group by period
)

select
    spine.ts::varchar as ts,
    coalesce(stream_agg.new_count, 0)::int as new_count,
    coalesce(stream_agg.known_count, 0)::int as known_count,
    coalesce(stream_agg.total_count, 0)::int as total_count
from spine
left join stream_agg on spine.ts = stream_agg.ts
order by spine.ts
