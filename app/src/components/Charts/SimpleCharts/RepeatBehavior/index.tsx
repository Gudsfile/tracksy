import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRepeatBehavior, type RepeatResult } from './query'
import { RepeatBehavior as RepeatBehaviorView } from './RepeatBehavior'

export function RepeatBehavior({ year }: { year: number }) {
    const { data } = useDBQueryFirst<RepeatResult>({
        query: queryRepeatBehavior(year),
        year,
    })

    if (!data) return null
    return <RepeatBehaviorView data={data} />
}
