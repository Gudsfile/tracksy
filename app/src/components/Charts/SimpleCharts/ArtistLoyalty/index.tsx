import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryArtistLoyalty, type ArtistLoyaltyResult } from './query'
import { ArtistLoyalty as ArtistLoyaltyView } from './ArtistLoyalty'

export function ArtistLoyalty({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<ArtistLoyaltyResult>({
        query: queryArtistLoyalty(year),
        year,
    })

    if (!isLoading && !data?.length) return null
    return <ArtistLoyaltyView data={data} isLoading={isLoading} />
}
