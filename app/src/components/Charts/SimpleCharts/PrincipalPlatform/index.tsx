import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryPrincipalPlatform, type PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<PlatformResult>({
        query: queryPrincipalPlatform(year),
        year,
    })

    return <PrincipalPlatformView data={data} isLoading={isLoading} />
}
