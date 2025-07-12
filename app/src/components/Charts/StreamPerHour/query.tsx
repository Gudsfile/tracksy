import { TABLE } from '../../../db/queries/constants'
import type { Int } from 'apache-arrow'

export const query = `
SELECT
    COALESCE(count_stream, 0)::INT AS count_stream,
    hour::INT AS hour
FROM (SELECT UNNEST(RANGE(24)) AS hour)
LEFT JOIN (
    SELECT
        COUNT(*) AS count_stream,
        HOUR(ts::DATETIME) AS hour
    FROM ${TABLE}
    GROUP BY HOUR(ts::DATETIME)
) USING(hour)
ORDER BY hour
`

export type QueryResult = {
    ms_played: Int
    ts: Int
}
