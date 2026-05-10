import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryHourlyStreams from './HourlyStreams.sql?raw'

export type HourlyStreamsQueryResult = {
    hour: number
    count_streams: number
    ms_played: number
}

export function buildHourlyStreamsQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQueryHourlyStreams
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
