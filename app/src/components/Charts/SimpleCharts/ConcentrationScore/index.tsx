import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryConcentrationScore, ConcentrationResult } from './query'
import { ConcentrationScore as ConcentrationScoreView } from './ConcentrationScore'

export function ConcentrationScore() {
    const [data, setData] = useState<ConcentrationResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryConcentrationScore()
            const result = await queryDBAsJSON<ConcentrationResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [])

    if (!data) return null
    return <ConcentrationScoreView data={data} />
}
