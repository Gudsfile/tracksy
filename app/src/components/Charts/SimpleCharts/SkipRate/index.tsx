import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySkipRate, type SkipRateResult } from './query'
import { SkipRate as SkipRateView } from './SkipRate'

export function SkipRate({ year }: { year: number }) {
    const { data } = useDBQueryFirst<SkipRateResult>({
        query: querySkipRate(year),
        year,
    })

    if (!data) return null
    return <SkipRateView data={data} />
}
