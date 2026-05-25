select
    count(distinct ${entity_column})::int as total_distinct,
    (count(*) - count(distinct ${entity_column}))::int as total_repeat,
    count(*)::int as total_streams
from ${table}
where ${year_condition}
