import { TABLE } from '../../../../db/queries/constants'
import sqlQueryListeningRhythm from './ListeningRhythm.sql?raw'

export type ListeningRhythmResult = {
    morning: number
    afternoon: number
    evening: number
    night: number
    total: number
}

export function queryListeningRhythm(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryListeningRhythm
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
