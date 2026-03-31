import { TABLE } from '../../../../db/queries/constants'
import sqlQueryRepeatBehavior from './RepeatBehavior.sql?raw'

export type RepeatResult = {
    total_repeat_sequences: number
    max_consecutive: number
    most_repeated_track: string
    avg_repeat_length: number
}

export function queryRepeatBehavior(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryRepeatBehavior
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
