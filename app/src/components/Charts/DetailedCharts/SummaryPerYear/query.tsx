import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySummaryPerYear from './SummaryPerYear.sql?raw'

export function summarizePerYearQuery(year: number | undefined) {
    const condition = year !== undefined ? 'ranked_streams.year = ?' : '1=1'
    const params: unknown[] = year !== undefined ? [Math.trunc(year)] : []
    return {
        sql: sqlQuerySummaryPerYear
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}

export type SummaryPerYearQueryResult = {
    year: number
    type: string
    count_streams: number
}
