import { TABLE } from '../../db/queries/constants'

export const summarizeQuery = `
WITH monthly_aggregates AS (
    SELECT SUM(ms_played) AS monthly_duration FROM ${TABLE} GROUP BY YEAR(ts::DATE), MONTH(ts::DATE)
),
hourly_aggregates AS (
    SELECT COUNT(*) AS count_hourly_stream FROM ${TABLE} GROUP BY YEAR(ts::DATE), HOUR(ts::DATETIME)
)
SELECT
    MIN(ts::DATETIME) AS min_datetime,
    MAX(ts::DATETIME) AS max_datetime,
    (SELECT MAX(count_hourly_stream) FROM hourly_aggregates) AS max_count_hourly_stream,
    (SELECT MAX(monthly_duration) FROM monthly_aggregates) AS max_monthly_duration
FROM ${TABLE};
`

export type SummarizeDataQueryResult = {
    min_datetime: string
    max_datetime: string
    max_count_hourly_stream: number
    max_monthly_duration: number
}
