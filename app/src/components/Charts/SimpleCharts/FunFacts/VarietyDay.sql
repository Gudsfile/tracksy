select
    cast(cast(ts as date) as varchar) as main_text,
    cast(count(distinct artist_name) as integer) as value,
    'variety_day' as fact_type,
    'different artists' as unit,
    'record of diversity in one day' as context
from ${table}
group by cast(ts as date)
order by value desc
limit 1
