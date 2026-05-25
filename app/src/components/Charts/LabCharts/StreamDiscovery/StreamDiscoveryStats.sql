with first_listen as (
    select
        ${entity_column},
        min(ts::date) as first_date
    from ${table}
    group by ${entity_column}
)

select
    count(
        distinct case when ${new_condition} then s.${entity_column} end
    )::int as total_new,
    (
        count(distinct s.${entity_column})
        - count(
            distinct case when ${new_condition} then s.${entity_column} end
        )
    )::int as total_known,
    count(distinct s.${entity_column})::int as total_distinct
from ${table} as s
inner join first_listen as f on s.${entity_column} = f.${entity_column}
where ${year_condition}
