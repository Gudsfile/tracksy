select
    track_name as main_text,
    'track_proposition' as fact_type,
    'by ' || artist_name as fact_value
from ${table}
where track_name is not null
USING SAMPLE 1
