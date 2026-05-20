import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuerySummaryPerYear from './SummaryPerYear.sql?raw'

export function summarizePerYearQuery(year: number | undefined) {
    return sqlQuerySummaryPerYear
        .replaceAll('${table}', TABLE)
        .replaceAll(
            '${year_condition}',
            buildYearCondition(year, 'ranked_streams.year')
        )
}

export type SummaryPerYearQueryResult = {
    year: number
    type: string
    count_streams: number
}
