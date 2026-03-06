import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryArtistLoyalty, ArtistLoyaltyResult } from './query'
import { ArtistLoyalty as ArtistLoyaltyView } from './ArtistLoyalty'

export function ArtistLoyalty({ year }: { year: number }) {
    const [data, setData] = useState<ArtistLoyaltyResult[] | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryArtistLoyalty(year)
            const result = await queryDBAsJSON<ArtistLoyaltyResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (!data || data.length === 0) return null
    return <ArtistLoyaltyView data={data} />
}
