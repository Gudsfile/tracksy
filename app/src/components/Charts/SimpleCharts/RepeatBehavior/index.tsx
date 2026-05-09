import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRepeatBehavior, type RepeatResult } from './query'
import { RepeatBehavior as RepeatBehaviorView } from './RepeatBehavior'

export function RepeatBehavior({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<RepeatResult>({
        query: queryRepeatBehavior(year),
        year,
    })

    if (!isLoading && (!data || data.total_repeat_sequences === 0)) return null
    return <RepeatBehaviorView data={data} isLoading={isLoading} />
}
