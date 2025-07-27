import { TABLE } from '../../db/queries/constants'
import type { Timestamp, Int } from 'apache-arrow'

export const query = `
SELECT
  min(min_datetime) min_datetime,
  max(max_datetime) max_datetime,
  max(count_hourly_stream) max_count_hourly_stream
FROM (
  SELECT
    min(ts::datetime) min_datetime,
    max(ts::datetime) max_datetime,
    count(*) count_hourly_stream
  FROM ${TABLE}
  GROUP BY hour(ts::datetime), year(ts::datetime)
)
`

export type SummarizeData = {
    min_datetime: Timestamp
    max_datetime: Timestamp
    max_count_hourly_stream: Int
}
