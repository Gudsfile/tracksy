select
    track_name as entity,
    artist_name as parent_entity
from ${table}
where track_name is not null
USING SAMPLE 1
