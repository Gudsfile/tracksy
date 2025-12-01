import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryRepeatBehavior, RepeatResult } from './query'
import { RepeatBehavior as RepeatBehaviorView } from './RepeatBehavior'

export function RepeatBehavior() {
    const [data, setData] = useState<RepeatResult | undefined>(undefined)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryRepeatBehavior()
            const result = await queryDBAsJSON<RepeatResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [])

    if (!data) return null
    return <RepeatBehaviorView data={data} />
}
