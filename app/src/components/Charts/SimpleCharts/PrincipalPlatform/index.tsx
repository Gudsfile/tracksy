import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryPrincipalPlatform, type PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform({ year }: { year: number | undefined }) {
    const { sql, params } = queryPrincipalPlatform(year)
    const { data } = useDBQueryMany<PlatformResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <PrincipalPlatformView data={data} />
}
