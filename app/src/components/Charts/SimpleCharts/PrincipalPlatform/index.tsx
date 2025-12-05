import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryPrincipalPlatform, PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform({ year }: { year: number }) {
    const [data, setData] = useState<PlatformResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryPrincipalPlatform(year)
            const result = await queryDBAsJSON<PlatformResult>(sql)
            setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <PrincipalPlatformView data={data} />
}
