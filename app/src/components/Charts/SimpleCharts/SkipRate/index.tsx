import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySkipRate, type SkipRateResult } from './query'
import { SkipRate as SkipRateView } from './SkipRate'

export function SkipRate({ year }: { year: number | undefined }) {
    const { sql, params } = querySkipRate(year)
    const { data } = useDBQueryFirst<SkipRateResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <SkipRateView data={data} />
}
