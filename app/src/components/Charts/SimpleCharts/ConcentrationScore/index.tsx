import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryConcentrationScore, type ConcentrationResult } from './query'
import { ConcentrationScore as ConcentrationScoreView } from './ConcentrationScore'

export function ConcentrationScore({ year }: { year: number | undefined }) {
    const { sql, params } = queryConcentrationScore(year)
    const { data } = useDBQueryFirst<ConcentrationResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <ConcentrationScoreView data={data} />
}
