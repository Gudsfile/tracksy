import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryPrincipalPlatform from './PrincipalPlatform.sql?raw'

export type PlatformResult = {
    platform: string
    stream_count: number
    pct: number
}

export function queryPrincipalPlatform(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryPrincipalPlatform
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
