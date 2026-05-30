import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryListeningBingo from './ListeningBingo.sql?raw'

export function listeningBingoQueryByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryListeningBingo
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type ListeningBingoQueryResult = {
    stream_date_ts: number // epoch ms, consistent with Top10Race
    day_of_week: number // 0 = Sun, 1 = Mon, ..., 6 = Sat (DuckDB dayofweek convention)
    play_hour: number // 0-23
    cumulative_count: number
}
