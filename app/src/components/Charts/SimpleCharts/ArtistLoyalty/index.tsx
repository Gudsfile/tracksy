import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryArtistLoyalty, type ArtistLoyaltyResult } from './query'
import { ArtistLoyalty as ArtistLoyaltyView } from './ArtistLoyalty'

export function ArtistLoyalty({ year }: { year: number | undefined }) {
    const { sql, params } = queryArtistLoyalty(year)
    const { data } = useDBQueryMany<ArtistLoyaltyResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <ArtistLoyaltyView data={data} />
}
