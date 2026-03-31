import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryEvolutionOverTime, type EvolutionResult } from './query'
import { EvolutionOverTime as EvolutionOverTimeView } from './EvolutionOverTime'

export function EvolutionOverTime({ year }: { year: number | undefined }) {
    const { data } = useDBQueryMany<EvolutionResult>({
        query: queryEvolutionOverTime(),
        year,
    })

    if (!data?.length) return null
    return <EvolutionOverTimeView data={data} year={year} />
}
