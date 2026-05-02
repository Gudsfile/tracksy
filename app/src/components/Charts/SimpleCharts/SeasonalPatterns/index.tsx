import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySeasonalPatterns, type SeasonalResult } from './query'
import { SeasonalPatterns as SeasonalPatternsView } from './SeasonalPatterns'

export function SeasonalPatterns({ year }: { year: number | undefined }) {
    const { sql, params } = querySeasonalPatterns(year)
    const { data } = useDBQueryFirst<SeasonalResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <SeasonalPatternsView data={data} />
}
