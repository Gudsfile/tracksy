/**
 * Generic stream record interface.
 * This serves as the canonical data model for all providers.
 *
 * Future providers will map their data to this structure.
 */
export interface StreamRecord {
    /**
     * Unique track identifier (URI format).
     */
    track_uri: string

    /**
     * Track name
     */
    track_name: string

    /**
     * Artist name
     */
    artist_name: string // TODO: allow list of artists

    /**
     * Timestamp of the stream in ISO 8601 format
     */
    ts: string

    /**
     * Duration played in milliseconds
     */
    ms_played: number

    [key: string]: unknown
}
