import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRepeatBehavior, type RepeatResult } from './query'
import { RepeatBehavior as RepeatBehaviorView } from './RepeatBehavior'

export function RepeatBehavior({ year }: { year: number | undefined }) {
    const { sql, params } = queryRepeatBehavior(year)
    const { data } = useDBQueryFirst<RepeatResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <RepeatBehaviorView data={data} />
}
