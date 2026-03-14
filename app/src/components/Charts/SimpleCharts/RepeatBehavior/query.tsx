import { TABLE } from '../../../../db/queries/constants'
import sqlQueryRepeatBehavior from './RepeatBehavior.sql?raw'

export type RepeatResult = {
    total_repeat_sequences: number
    max_consecutive: number
    most_repeated_track: string
    avg_repeat_length: number
}

export function queryRepeatBehavior(year: number): string {
    return sqlQueryRepeatBehavior
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
