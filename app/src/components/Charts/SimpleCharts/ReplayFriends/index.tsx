import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryArtistReplayDistribution, ArtistReplayBin } from './query'
import { ReplayFriends as ReplayFriendsView } from './ReplayFriends'

export function ReplayFriends({ year }: { year: number }) {
    const [data, setData] = useState<ArtistReplayBin[] | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryArtistReplayDistribution(year)
            const result = await queryDBAsJSON<ArtistReplayBin[]>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (!data || data.length === 0) return null
    return <ReplayFriendsView data={data} />
}
