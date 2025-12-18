import type { StreamRecord, ProviderMetadata } from './types'
import { isValidStreamRecord, isLongEnoughStream } from './validation'

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
    abstract transform(rawData: Partial<StreamRecord>[]): StreamRecord[]

    /**
     * Default filtering pipeline
     * Providers can override if needed
     */
    protected filterAndValidate(
        records: Partial<StreamRecord>[]
    ): StreamRecord[] {
        return records.filter(isValidStreamRecord).filter(isLongEnoughStream)
    }
}
