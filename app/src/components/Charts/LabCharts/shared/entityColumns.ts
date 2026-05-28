import type { EntityType } from './types'

export const ENTITY_COLUMN: Record<EntityType, string> = {
    tracks: 'track_uri',
    artists: 'artist_name',
    albums: 'album_name',
}
