select
    count(*)::integer as count_streams,
    sum(ms_played)::double as ms_played
from ${table}
