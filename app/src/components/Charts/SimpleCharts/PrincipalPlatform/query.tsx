import { TABLE } from '../../../../db/queries/constants'
import sqlQueryPrincipalPlatform from './PrincipalPlatform.sql?raw'

export type PlatformResult = {
    platform: string
    stream_count: number
    pct: number
}

export function queryPrincipalPlatform(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryPrincipalPlatform
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
