import { TABLE } from '../../../../db/queries/constants'
import sqlQuery from './BingeListener.sql?raw'

export type BingeListenerResult = {
    date: string
    hours_played: number
}

export function buildBingeListenerQuery(): string {
    return sqlQuery.replaceAll('${table}', TABLE)
}
