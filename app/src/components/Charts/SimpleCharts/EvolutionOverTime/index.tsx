import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryEvolutionOverTime, EvolutionResult } from './query'
import { EvolutionOverTime as EvolutionOverTimeView } from './EvolutionOverTime'

export function EvolutionOverTime({ year }: { year: number }) {
    const [data, setData] = useState<EvolutionResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryEvolutionOverTime()
            const result = await queryDBAsJSON<EvolutionResult>(sql)
            setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <EvolutionOverTimeView data={data} year={year} />
}
