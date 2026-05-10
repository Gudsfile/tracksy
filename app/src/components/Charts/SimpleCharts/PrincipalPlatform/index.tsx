import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryPrincipalPlatform, type PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<PlatformResult>({
        query: queryPrincipalPlatform(year),
        year,
    })

    if (!isLoading && (!data || data.length <= 1)) return null
    return <PrincipalPlatformView data={data} isLoading={isLoading} />
}
