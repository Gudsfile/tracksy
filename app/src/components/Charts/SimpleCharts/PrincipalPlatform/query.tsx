import { TABLE } from '../../../../db/queries/constants'
import sqlQueryPrincipalPlatform from './PrincipalPlatform.sql?raw'

export type PlatformResult = {
    platform: string
    stream_count: number
    pct: number
}

export function queryPrincipalPlatform(year: number): string {
    return sqlQueryPrincipalPlatform
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
