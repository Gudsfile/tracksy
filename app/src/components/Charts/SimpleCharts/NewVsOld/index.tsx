import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryNewVsOld, NewVsOldResult } from './query'
import { NewVsOld as NewVsOldView } from './NewVsOld'

export function NewVsOld({ year }: { year: number }) {
    const [data, setData] = useState<NewVsOldResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryNewVsOld(year)
            const result = await queryDBAsJSON<NewVsOldResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [year])

    if (!data) return null
    return <NewVsOldView data={data} />
}
