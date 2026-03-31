import { TABLE } from '../../../../db/queries/constants'
import sqlQueryConcentrationScore from './ConcentrationScore.sql?raw'

export type ConcentrationResult = {
    top5_pct: number
    top10_pct: number
    top20_pct: number
}

export function queryConcentrationScore(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryConcentrationScore
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
