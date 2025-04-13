import { TABLE } from '../../../db/queries/constants'
import type { Int, Utf8 } from 'apache-arrow'

export const query = `
SELECT
    COALESCE(count_stream, 0)::INT AS count_stream,
    hour::INT AS hour,
    username
FROM (
    SELECT
        UNNEST(RANGE(24)) AS hour,
        username
    FROM (
        SELECT DISTINCT username
        FROM ${TABLE}
    )
)
LEFT JOIN (
    SELECT
        COUNT(*) AS count_stream,
        HOUR(ts::DATETIME) AS hour,
        username
    FROM ${TABLE}
    GROUP BY HOUR(ts::DATETIME), username
) USING(hour, username)
ORDER BY hour
`

export type QueryResult = {
    ms_played: Int
    ts: Int
    username: Utf8
}
