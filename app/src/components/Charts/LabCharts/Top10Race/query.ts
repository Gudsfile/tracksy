import { TABLE } from '../../../../db/queries/constants'
import sqlTop10Race from './Top10Artists.sql?raw'
import sqlTop10Tracks from './Top10Tracks.sql?raw'
import sqlTop10Albums from './Top10Albums.sql?raw'

import type { EntityType } from '../shared/types'

const sqlByEntity: Record<EntityType, string> = {
    artists: sqlTop10Race,
    tracks: sqlTop10Tracks,
    albums: sqlTop10Albums,
}

export function queryTop10Race(
    year?: number,
    entityType: EntityType = 'artists'
) {
    let query = sqlByEntity[entityType].replaceAll('${table}', TABLE)
    query = year
        ? query.replace('${yearFilter}', `AND year(ts::datetime) = ${year}`)
        : query.replace('${yearFilter}', '')
    return query
}

export type Top10RaceQueryResult = {
    stream_date_ts: number
    entity_name: string
    play_count: number
}
