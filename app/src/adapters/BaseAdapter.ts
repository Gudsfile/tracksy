import type { StreamRecord, ProviderMetadata } from './types'

/**
 * Abstract base class for streaming provider adapters.
 *
 * Each provider must implement this interface to transform
 * their specific data format into the canonical StreamRecord
 * format.
 */
export abstract class BaseAdapter {
    /**
     * Get metadata about this provider
     */
    abstract getMetadata(): ProviderMetadata

    /**
     * Validate if a file belongs to this provider
     *
     * @param file - File to validate
     * @returns true if file matches this provider's format
     */
    abstract validateFile(file: File): boolean

    /**
     * Transform provider-specific raw data into canonical StreamRecord format
     *
     * @param rawData - Raw data from provider's export file
     * @returns Array of normalized stream records
     */
    abstract transform(rawData: unknown[]): StreamRecord[]

    /**
     * Filter to music only
     * and out short streams
     *
     * @param records - Array of stream records to filter
     * @returns Filtered array containing only valid records
     */
    protected filterRecords(records: StreamRecord[]): StreamRecord[] {
        return records.filter(
            (record) => this.isMusic(record) && this.isLongEnoughStream(record)
        )
    }

    protected filterRecordsWithWarning(
        records: StreamRecord[]
    ): StreamRecord[] {
        return records.filter((record) => {
            if (!this.tsIsPresent(record)) {
                console.warn('Record is missing timestamp')
                return false
            }
            if (!this.msPlayedIsPresentAndNumber(record)) {
                console.warn(
                    'Record is missing ms_played or ms_played is not a number'
                )
                return false
            }
            return true
        })
    }

    /**
     * Filter to music only (exclude podcasts, audiobooks, etc.)
     */
    private isMusic(record: StreamRecord): boolean {
        return record.spotify_track_uri !== null
    }

    /**
     * Filter out short streams (less than 30 seconds)
     * Most providers consider a stream as a play of at least 30 seconds
     * Also allows noise in the data to be removed
     */
    private isLongEnoughStream(record: StreamRecord): boolean {
        return record.ms_played >= 30000
    }

    private tsIsPresent(record: StreamRecord): boolean {
        return (
            record.ts !== null &&
            record.ts !== undefined &&
            typeof record.ts === 'string'
        )
    }

    private msPlayedIsPresentAndNumber(record: StreamRecord): boolean {
        return (
            record.ms_played !== null &&
            record.ms_played !== undefined &&
            typeof record.ms_played === 'number'
        )
    }
}
