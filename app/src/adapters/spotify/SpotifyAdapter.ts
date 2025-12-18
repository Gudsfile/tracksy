import { BaseAdapter } from '../BaseAdapter'
import type { StreamRecord, ProviderMetadata } from '../types'

/**
 * Spotify streaming history adapter.
 *
 * Since the canonical data model is based on Spotify's schema,
 * this adapter is mostly pass-through with validation.
 */
export class SpotifyAdapter extends BaseAdapter {
    private metadata: ProviderMetadata = {
        provider: 'spotify',
        displayName: 'Spotify',
        filePattern: /^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i,
        fileContentType: 'application/json',
    }

    getMetadata(): ProviderMetadata {
        return this.metadata
    }

    validateFile(file: File): boolean {
        return this.metadata.filePattern.test(file.name)
    }

    transform(rawData: unknown[]): StreamRecord[] {
        const records = rawData as Partial<StreamRecord>[]
        return this.filterAndValidate(records)
    }
}
