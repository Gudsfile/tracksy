with
selected_streams as (
    select *
    from ${table}
    where ${year_condition}
),

day_streams as (
    select
        dayname(ts::date) as day_name,
        count(*) as stream_count,
        count(*)::double / (
            select count(*)
            from selected_streams
        )::double * 100 as pct
    from selected_streams
    group by dayname(ts::date)
)

select
    day_name,
    stream_count::double as stream_count,
    pct
from day_streams
order by
    case day_name
        when 'Monday' then 1
        when 'Tuesday' then 2
        when 'Wednesday' then 3
        when 'Thursday' then 4
        when 'Friday' then 5
        when 'Saturday' then 6
        when 'Sunday' then 7
    end
