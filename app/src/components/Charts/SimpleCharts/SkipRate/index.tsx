import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { querySkipRate, SkipRateResult } from './query'
import { SkipRate as SkipRateView } from './SkipRate'

export function SkipRate({ year }: { year: number }) {
    const [data, setData] = useState<SkipRateResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = querySkipRate(year)
            const result = await queryDBAsJSON<SkipRateResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [year])

    if (!data) return null
    return <SkipRateView data={data} />
}
