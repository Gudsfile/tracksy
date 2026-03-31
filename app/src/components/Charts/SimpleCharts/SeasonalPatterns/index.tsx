import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySeasonalPatterns, type SeasonalResult } from './query'
import { SeasonalPatterns as SeasonalPatternsView } from './SeasonalPatterns'

export function SeasonalPatterns({ year }: { year: number | undefined }) {
    const { data } = useDBQueryFirst<SeasonalResult>({
        query: querySeasonalPatterns(year),
        year,
    })

    if (!data) return null
    return <SeasonalPatternsView data={data} />
}
