select
    cast(cast(ts as date) as varchar) as date,
    cast(sum(ms_played) / 3600000.0 as double) as hours_played
from ${table}
where ${year_condition}
group by cast(ts as date)
order by hours_played desc
limit 1
