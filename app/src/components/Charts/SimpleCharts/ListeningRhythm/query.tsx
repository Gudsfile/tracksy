import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryListeningRhythm from './ListeningRhythm.sql?raw'

export type ListeningRhythmResult = {
    morning: number
    afternoon: number
    evening: number
    night: number
    total: number
}

export function queryListeningRhythm(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryListeningRhythm
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
