import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10ArtistsEvolution from './Top10ArtistsEvolution.sql?raw'
import sqlQueryTop10TracksEvolution from './Top10TracksEvolution.sql?raw'
import sqlQueryTop10AlbumsEvolution from './Top10AlbumsEvolution.sql?raw'

import type { EntityType } from '../shared/types'

const sqlByEntity: Record<EntityType, string> = {
    artists: sqlQueryTop10ArtistsEvolution,
    tracks: sqlQueryTop10TracksEvolution,
    albums: sqlQueryTop10AlbumsEvolution,
}

export function queryTop10Evolution(
    year?: number,
    entityType: EntityType = 'artists'
) {
    const yearFilter = year ? `AND year(ts::datetime) <= ${year}` : ''
    return sqlByEntity[entityType]
        .replaceAll('${table}', TABLE)
        .replace('${yearFilter}', yearFilter)
}

export type Top10EvolutionQueryResult = {
    stream_year: number
    entity_name: string
    stream_rank: number
    play_count: number
}
