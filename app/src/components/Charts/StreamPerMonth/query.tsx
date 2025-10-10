import { TABLE } from '../../../db/queries/constants'

export function queryByYear(year: number | undefined) {
    return `
    WITH all_months AS (
      SELECT LAST_DAY(month) as ts
      FROM generate_series(
        CAST('${year ? year : '2006'}-01-01' AS DATE),
        CAST('${year ? year : new Date().getFullYear()}-12-01' AS DATE),
        INTERVAL 1 MONTH
      ) AS t(month)
    ),
    monthly_streams AS (
      SELECT
        LAST_DAY(ts::DATE) as ts,
        SUM(ms_played) as ms_played
      FROM ${TABLE}
      ${year ? `WHERE YEAR(ts::DATE) = ${year}` : ''}
      GROUP BY LAST_DAY(ts::DATE)
    )
    SELECT
      MAKE_DATE(YEAR(all_months.ts), MONTH(all_months.ts), 1) as ts,
      COALESCE(monthly_streams.ms_played, 0) as ms_played
    FROM all_months
    LEFT JOIN monthly_streams ON all_months.ts = monthly_streams.ts
    ORDER BY all_months.ts`
}

export type QueryResult = {
    ms_played: number
    ts: number
}
