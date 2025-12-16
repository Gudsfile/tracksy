import { TABLE } from '../../../../db/queries/constants'

export function streamPerDayOfWeekQueryByYear(year: number | undefined) {
    return `
SELECT
  DAYOFWEEK(ts::DATE)::INTEGER AS dayOfWeek,
  HOUR(ts::DATETIME)::INTEGER AS hour,
  COUNT(*)::DOUBLE AS count_streams
FROM ${TABLE}
${year ? `WHERE YEAR(ts:: DATETIME) = ${year}` : ''}
GROUP BY DAYOFWEEK(ts::DATE), HOUR(ts::DATETIME)
ORDER BY 1, 2
`
}

export type StreamPerDayOfWeekQueryResult = {
    dayOfWeek: number
    hour: number
    count_streams: number
}
