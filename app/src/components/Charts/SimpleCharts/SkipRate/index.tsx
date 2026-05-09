import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySkipRate, type SkipRateResult } from './query'
import { SkipRate as SkipRateView } from './SkipRate'

export function SkipRate({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<SkipRateResult>({
        query: querySkipRate(year),
        year,
    })

    if (!isLoading && !data) return null
    return <SkipRateView data={data} isLoading={isLoading} />
}
