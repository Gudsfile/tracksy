import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreamPerHour from './StreamPerHour.sql?raw'

export function queryStreamsPerHoursByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts::DATETIME) = ${year}` : '1=1'
    return sqlQueryStreamPerHour
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type StreamPerHourQueryResult = {
    hour: number
    count_streams: number
    ms_played: number
}
