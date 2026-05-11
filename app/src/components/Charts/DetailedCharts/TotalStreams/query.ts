import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTotalStreams from './TotalStreams.sql?raw'

export function queryTotalStreams() {
    return sqlQueryTotalStreams.replaceAll('${table}', TABLE)
}

export type TotalStreamsQueryResult = {
    count_streams: number
    ms_played: number
}
