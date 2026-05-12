import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { buildVarietyDayQuery, type VarietyDayResult } from './query'
import { VarietyDay as VarietyDayView } from './VarietyDay'

export function VarietyDay({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<VarietyDayResult>({
        query: buildVarietyDayQuery(year),
        year,
    })
    return <VarietyDayView data={data} isLoading={isLoading} />
}
