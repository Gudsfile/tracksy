import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryDiversityScore, DiversityResult } from './query'
import { DiversityScore as DiversityScoreView } from './DiversityScore'

export function DiversityScore({ year }: { year: number }) {
    const [data, setData] = useState<DiversityResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryDiversityScore(year)
            const result = await queryDBAsJSON<DiversityResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [year])

    if (!data) return null
    return <DiversityScoreView data={data} />
}
