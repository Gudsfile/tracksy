import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { buildVarietyDayQuery, type VarietyDayResult } from './query'
import { VarietyDay as VarietyDayView } from './VarietyDay'

export function VarietyDay() {
    const { data, isLoading } = useDBQueryFirst<VarietyDayResult>({
        query: buildVarietyDayQuery(),
    })
    return <VarietyDayView data={data} isLoading={isLoading} />
}
