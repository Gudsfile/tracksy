import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySeasonalPatterns, SeasonalResult } from './query'
import { SeasonalPatterns as SeasonalPatternsView } from './SeasonalPatterns'

export function SeasonalPatterns({ year }: { year: number }) {
    const { data } = useDBQueryFirst<SeasonalResult>({
        query: querySeasonalPatterns(year),
        year,
    })

    if (!data) return null
    return <SeasonalPatternsView data={data} />
}
