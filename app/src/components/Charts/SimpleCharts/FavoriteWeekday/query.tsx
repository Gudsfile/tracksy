import { TABLE } from '../../../../db/queries/constants'

export type FavoriteWeekdayResult = {
    day_name: string
    stream_count: number
    pct: number
}

export function queryFavoriteWeekday(year: number): string {
    return `
    WITH 
    selected_streams AS (
      SELECT * FROM ${TABLE} WHERE YEAR(ts::date) = ${year}
    ),
    day_streams AS (
      SELECT
        DAYNAME(ts::DATE) as day_name,
        COUNT(*) as stream_count,
        COUNT(*)::DOUBLE / (SELECT COUNT(*) FROM selected_streams)::DOUBLE * 100 as pct
      FROM selected_streams
      GROUP BY DAYNAME(ts::DATE)
    )
    SELECT
      day_name,
      stream_count::DOUBLE as stream_count,
      pct
    FROM day_streams
    ORDER BY 
      CASE day_name
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END
  `
}
