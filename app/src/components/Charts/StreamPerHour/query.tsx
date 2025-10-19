import { TABLE } from '../../../db/queries/constants'

export function queryByYear(year: number | undefined) {
    return `
SELECT
    hour::INT AS hour,
    COALESCE(count_streams, 0)::INT AS count_streams,
    COALESCE(ms_played, 0)::INT AS ms_played
FROM (SELECT UNNEST(RANGE(24)) AS hour)
LEFT JOIN (
    SELECT
        HOUR(ts::DATETIME) AS hour,
        COUNT(*) AS count_streams,
        SUM(ms_played) AS ms_played
    FROM ${TABLE}
    ${year ? `WHERE YEAR(ts::DATETIME) = ${year}` : ''}
    GROUP BY HOUR(ts::DATETIME)
) USING(hour)
ORDER BY hour
`
}

export type QueryResult = {
    hour: number
    count_streams: number
    ms_played: number
}
