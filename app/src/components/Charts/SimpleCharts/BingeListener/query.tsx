import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuery from './BingeListener.sql?raw'

export type BingeListenerResult = {
    date: string
    hours_played: number
}

export function buildBingeListenerQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQuery
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
