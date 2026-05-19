select
    track_name as main_text,
    'by ' || artist_name as fact_value
from ${table}
where track_name is not null
USING SAMPLE 1
