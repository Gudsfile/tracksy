import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreamPerMonth from './StreamPerMonth.sql?raw'

export function queryByYear(year: number | undefined) {
    const currentYear = new Date().getFullYear()
    const startYear = year ? String(year) : '2006'
    const endYear = year ? String(year) : String(currentYear)
    const yearCondition = year ? `YEAR(ts::DATE) = ${year}` : '1=1'

    return sqlQueryStreamPerMonth
        .replaceAll('${table}', TABLE)
        .replaceAll('${ start_date}', `${startYear}-01-01`)
        .replaceAll('${ end_date}', `${endYear}-12-01`)
        .replaceAll('${year_condition}', yearCondition)
}

export function queryStreamsPerMonthByYear(year: number | undefined) {
    return queryByYear(year)
}

export type StreamPerMonthQueryResult = {
    ts: number
    ms_played: number
    count_streams: number
}
