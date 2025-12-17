import { TABLE } from '../../../../db/queries/constants'
import sqlQueryConcentrationScore from './ConcentrationScore.sql?raw'

export type ConcentrationResult = {
    top5_pct: number
    top10_pct: number
    top20_pct: number
}

export function queryConcentrationScore(year: number): string {
    return sqlQueryConcentrationScore
        .replaceAll('{{table}}', TABLE)
        .replaceAll('{{year}}', String(year))
}
