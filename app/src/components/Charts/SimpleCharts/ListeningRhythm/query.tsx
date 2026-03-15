import { TABLE } from '../../../../db/queries/constants'
import sqlQueryListeningRhythm from './ListeningRhythm.sql?raw'

export type ListeningRhythmResult = {
    morning: number
    afternoon: number
    evening: number
    night: number
    total: number
}

export function queryListeningRhythm(year: number): string {
    return sqlQueryListeningRhythm
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
