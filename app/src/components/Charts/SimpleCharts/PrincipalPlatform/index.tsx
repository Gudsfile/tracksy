import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryPrincipalPlatform, type PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform({ year }: { year: number }) {
    const { data } = useDBQueryMany<PlatformResult>({
        query: queryPrincipalPlatform(year),
        year,
    })

    if (!data?.length) return null
    return <PrincipalPlatformView data={data} />
}
