select
    track_name as main_text,
    artist_name as second_text,
    'your next listen is already waiting' as context
from ${table}
where track_name is not null
USING SAMPLE 1
