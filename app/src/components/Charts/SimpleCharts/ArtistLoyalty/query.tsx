import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryArtistLoyalty from './ArtistLoyalty.sql?raw'

export type ArtistLoyaltyResult = {
    stream_bin: string
    artist_count: number
    streams_in_bin: number
    share_of_total_streams: number
}

export function queryArtistLoyalty(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQueryArtistLoyalty
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
