select
    cast(cast(ts as date) as varchar) as main_text,
    cast((sum(ms_played) / 3600000.0) as integer) as fact_value,
    'binge_listener' as fact_type,
    'hours of listening' as unit,
    'your record of listening time in one day' as context
from ${table}
group by cast(ts as date)
order by sum(ms_played) desc
limit 1
