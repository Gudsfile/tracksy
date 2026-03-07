import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryConcentrationScore, ConcentrationResult } from './query'
import { ConcentrationScore as ConcentrationScoreView } from './ConcentrationScore'

export function ConcentrationScore({ year }: { year: number }) {
    const { data } = useDBQueryFirst<ConcentrationResult>({
        query: queryConcentrationScore(year),
        year,
    })

    if (!data) return null
    return <ConcentrationScoreView data={data} />
}
