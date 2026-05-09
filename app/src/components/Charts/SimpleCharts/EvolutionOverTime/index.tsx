import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryEvolutionOverTime, type EvolutionResult } from './query'
import { EvolutionOverTime as EvolutionOverTimeView } from './EvolutionOverTime'

export function EvolutionOverTime({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<EvolutionResult>({
        query: queryEvolutionOverTime(),
        year,
    })

    if (!isLoading && !data?.length) return null
    return (
        <EvolutionOverTimeView data={data} year={year} isLoading={isLoading} />
    )
}
