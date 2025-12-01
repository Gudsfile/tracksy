import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { querySeasonalPatterns, SeasonalResult } from './query'
import { SeasonalPatterns as SeasonalPatternsView } from './SeasonalPatterns'

export function SeasonalPatterns() {
    const [data, setData] = useState<SeasonalResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = querySeasonalPatterns()
            const result = await queryDBAsJSON<SeasonalResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [])

    if (!data) return null
    return <SeasonalPatternsView data={data} />
}
