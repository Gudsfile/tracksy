import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySummaryPerYear from './SummaryPerYear.sql?raw'

export function summarizePerYearQuery(year: number | undefined) {
    const yearCondition = year ? `ranked_streams.year = ${year}` : '1=1'
    return sqlQuerySummaryPerYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type SummaryPerYearQueryResult = {
    year: number
    type: string
    count_streams: number
}
