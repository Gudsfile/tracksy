import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryPrincipalPlatform, PlatformResult } from './query'
import { PrincipalPlatform as PrincipalPlatformView } from './PrincipalPlatform'

export function PrincipalPlatform() {
    const [data, setData] = useState<PlatformResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryPrincipalPlatform()
            const result = await queryDBAsJSON<PlatformResult>(sql)
            setData(result)
        }
        fetch()
    }, [])

    if (data.length === 0) return null
    return <PrincipalPlatformView data={data} />
}
