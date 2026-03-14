-- noqa: disable=all
-- Disable sqruff: DuckDB UNPIVOT syntax is not correctly parsed yet
-- and triggers false positives.
with
base as (
    select
        track_uri,
        ts::datetime as ts,
        year(ts::datetime)::int as year
    from ${table}
),

ranked_streams as (
    select
        year,
        track_uri,
        row_number() over (partition by track_uri order by ts) as rank_all_time,
        row_number() over (partition by track_uri, year order by ts) as rank_per_year,
        min(year) over (partition by track_uri) as first_year
    from base
)

unpivot (
    select
        year,
        count(*) filter (where rank_all_time = 1)::int as new_unique,
        count(*) filter (where first_year = year and rank_all_time != 1)::int as new_repeat,
        count(*) filter (where first_year < year and rank_per_year = 1)::int as old_unique,
        count(*) filter (where first_year < year and rank_per_year != 1)::int as old_repeat
    from ranked_streams
    where ${year_condition}
    group by year
) on columns (* exclude (year)) into name type value count_streams
