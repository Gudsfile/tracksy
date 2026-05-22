import { TABLE } from '../../../../db/queries/constants'
import sqlTop10Artists from './Top10BillboardRace.sql?raw'
import sqlTop10Tracks from './Top10BillboardRaceTracks.sql?raw'
import sqlTop10Albums from './Top10BillboardRaceAlbums.sql?raw'

export type EntityType = 'artists' | 'tracks' | 'albums'

const sqlByEntity: Record<EntityType, string> = {
    artists: sqlTop10Artists,
    tracks: sqlTop10Tracks,
    albums: sqlTop10Albums,
}

export function queryTop10BillboardRace(
    year?: number,
    entityType: EntityType = 'artists'
) {
    let query = sqlByEntity[entityType].replaceAll('${table}', TABLE)
    query = year
        ? query.replace('${yearFilter}', `AND year(ts::datetime) = ${year}`)
        : query.replace('${yearFilter}', '')
    return query
}

export type Top10BillboardRaceQueryResult = {
    period_ts: number
    entity_name: string
    period_plays: number
}
