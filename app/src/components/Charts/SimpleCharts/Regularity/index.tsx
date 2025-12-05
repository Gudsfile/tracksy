import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryRegularity, RegularityResult } from './query'
import { Regularity as RegularityView } from './Regularity'

export function Regularity({ year }: { year: number }) {
    const [data, setData] = useState<RegularityResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryRegularity(year)
            const result = await queryDBAsJSON<RegularityResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [year])

    if (!data) return null
    return <RegularityView data={data} />
}
