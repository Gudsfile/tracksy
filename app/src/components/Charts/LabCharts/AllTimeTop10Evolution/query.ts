import { TABLE } from '../../../../db/queries/constants'
import sqlQueryAllTimeTop10ArtistsEvolution from './AllTimeTop10ArtistsEvolution.sql?raw'
import sqlQueryAllTimeTop10TracksEvolution from './AllTimeTop10TracksEvolution.sql?raw'
import sqlQueryAllTimeTop10AlbumsEvolution from './AllTimeTop10AlbumsEvolution.sql?raw'

import type { EntityType } from '../shared/types'

const sqlByEntity: Record<EntityType, string> = {
    artists: sqlQueryAllTimeTop10ArtistsEvolution,
    tracks: sqlQueryAllTimeTop10TracksEvolution,
    albums: sqlQueryAllTimeTop10AlbumsEvolution,
}

export function queryAllTimeTop10Evolution(
    year?: number,
    entityType: EntityType = 'artists'
) {
    const yearFilter = year ? `AND year(ts::datetime) <= ${year}` : ''
    return sqlByEntity[entityType]
        .replaceAll('${table}', TABLE)
        .replace('${yearFilter}', yearFilter)
}

export type AllTimeTop10EvolutionQueryResult = {
    stream_year: number
    entity_name: string
    stream_rank: number
    play_count: number
}
