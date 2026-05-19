import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { FunkWhaleV1Listen, FunkWhaleV1Response } from './types'

export class FunkWhaleStreamProvider extends StreamProvider<FunkWhaleV1Listen> {
    readonly name = 'funkwhale'
    readonly displayName = 'FunkWhale'
    readonly acceptedFormats = 'JSON'
    readonly filePattern = /^funkwhale-history\.json$/i
    readonly fileContentType = 'application/json'

    async readFile(file: File): Promise<FunkWhaleV1Listen[]> {
        const text = await file.text()
        const parsed: unknown = JSON.parse(text)
        if (
            parsed !== null &&
            typeof parsed === 'object' &&
            'results' in parsed
        ) {
            return (parsed as FunkWhaleV1Response).results
        }
        if (Array.isArray(parsed)) return parsed as FunkWhaleV1Listen[]
        throw new Error('Unrecognised FunkWhale export format')
    }

    transform(rawData: FunkWhaleV1Listen[]): StreamRecord[] {
        return rawData.map((listen) => {
            const { track } = listen
            return {
                track_uri: track.mbid
                    ? `funkwhale:${track.mbid}`
                    : `funkwhale:${track.artist.name}:${track.title}`,
                track_name: track.title,
                artist_name: track.artist.name,
                album_name: track.album?.title ?? '',
                ts: listen.creation_date,
                ms_played: track.duration ? track.duration * 1000 : 0,
                platform: 'funkwhale',
            }
        })
    }
}
