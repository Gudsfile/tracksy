select
    sum(
        case
            when
                hour(ts::timestamp) >= 6 and hour(ts::timestamp) < 12
                then 1
            else 0
        end
    )::double as morning,
    sum(
        case
            when
                hour(ts::timestamp) >= 12 and hour(ts::timestamp) < 18
                then 1
            else 0
        end
    )::double as afternoon,
    sum(
        case
            when
                hour(ts::timestamp) >= 18 and hour(ts::timestamp) < 22
                then 1
            else 0
        end
    )::double as evening,
    sum(
        case
            when
                hour(ts::timestamp) >= 22 or hour(ts::timestamp) < 6
                then 1
            else 0
        end
    )::double as night,
    count(*)::double as total
from ${table}
where year(ts::date) = ${year}
