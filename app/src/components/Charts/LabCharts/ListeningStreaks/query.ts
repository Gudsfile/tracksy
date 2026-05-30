import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import { TABLE } from '../../../../db/queries/constants'
import sqlQueryListeningStreaks from './ListeningStreaks.sql?raw'

export function queryListeningStreaks(year?: number) {
    return sqlQueryListeningStreaks
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', buildYearCondition(year))
}

export type ListeningStreaksQueryResult = {
    stream_date: string
}
