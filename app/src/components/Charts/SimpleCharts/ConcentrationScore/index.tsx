import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryConcentrationScore, type ConcentrationResult } from './query'
import { ConcentrationScore as ConcentrationScoreView } from './ConcentrationScore'

export function ConcentrationScore({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<ConcentrationResult>({
        query: queryConcentrationScore(year),
        year,
    })

    return <ConcentrationScoreView data={data} isLoading={isLoading} />
}
