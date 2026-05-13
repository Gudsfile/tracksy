import { TABLE } from '../../../../db/queries/constants'
import sqlQueryArtistDiscovery from './ArtistDiscovery.sql?raw'

export type ArtistDiscoveryQueryResult = {
    stream_year: number
    new_artists: number
    cumulative_artists: number
    avg_listens_per_artist: number
}

export function queryArtistDiscovery(): string {
    return sqlQueryArtistDiscovery.replaceAll('${table}', TABLE)
}
