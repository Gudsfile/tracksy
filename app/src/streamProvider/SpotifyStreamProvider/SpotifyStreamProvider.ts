import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { SpotifyRawStreamRecord } from './types'

/**
 * Spotify streaming history adapter.
 */
export class SpotifyStreamProvider extends StreamProvider<SpotifyRawStreamRecord> {
    name = 'spotify'
    displayName = 'Spotify'
    filePattern = /^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i
    fileContentType = 'application/json'

    /**
     * Read and parse Spotify JSON file
     *
     * @param file - Spotify streaming history JSON file
     * @returns Promise resolving to raw streaming data
     */
    async readFile(file: File): Promise<SpotifyRawStreamRecord[]> {
        const text = await file.text()
        const rawData = JSON.parse(text)

        if (!Array.isArray(rawData)) {
            throw new Error('Expected JSON array of streaming records')
        }

        return rawData
    }

    /**
     * Transform Spotify data to canonical format
     * Since our canonical format is based on Spotify's schema,
     * this is mostly a pass-through operation
     *
     * @param rawData - Raw Spotify streaming data
     * @returns Array of stream records in canonical format
     */
    transform(rawData: SpotifyRawStreamRecord[]): StreamRecord[] {
        const data = rawData.map(({ spotify_track_uri, ...rest }) => ({
            ...rest,
            track_uri: spotify_track_uri,
        }))

        return data as StreamRecord[]
    }
}
