/**
 * Generic stream record interface based on Spotify schema.
 * This serves as the canonical data model for all providers.
 *
 * Future providers will map their data to this structure.
 */
export interface StreamRecord {
    /**
     * Unique track identifier (URI format).
     */
    spotify_track_uri: string

    /**
     * Track name
     */
    master_metadata_track_name: string

    /**
     * Artist name (album artist for Spotify)
     */
    master_metadata_album_artist_name: string // TODO: allow list of artists

    /**
     * Timestamp of the stream in ISO 8601 format
     */
    ts: string

    /**
     * Duration played in milliseconds
     */
    ms_played: number

    /**
     * Allow additional provider-specific fields
     */
    [key: string]: unknown
}

/**
 * Metadata about a streaming provider
 */
export interface ProviderMetadata {
    /**
     * Provider identifier
     */
    provider: 'spotify' | 'deezer' | 'apple_music' | 'jellyfin' | 'funkwhale'

    /**
     * Regex pattern to validate file names for this provider
     */
    filePattern: RegExp

    /**
     * Human-readable provider name
     */
    displayName: string

    /**
     * Content type of the file for this provider
     */
    fileContentType: string
}
