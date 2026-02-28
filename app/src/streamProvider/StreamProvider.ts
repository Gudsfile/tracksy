import type { StreamRecord } from './types'
import { isValidStreamRecord, isLongEnoughStream } from './validation'

/**
 * Abstract base class for stream provider adapters.
 *
 * Each provider must implement this interface to transform
 * their specific data format into the canonical StreamRecord
 * format.
 *
 * @typeParam TRawData - The raw data type from the provider's export file
 */
export abstract class StreamProvider<TRawData = unknown> {
    abstract readonly name: string

    abstract readonly filePattern: RegExp

    abstract readonly displayName: string

    abstract readonly fileContentType: string

    /**
     * Validate if a file belongs to this provider
     *
     * @param file - File to validate
     * @returns true if file matches this provider's format
     */
    validateFile(file: File): boolean {
        return this.filePattern.test(file.name)
    }

    /**
     * Read and parse file content into raw data
     *
     * @param file - File to read
     * @returns Promise resolving to raw data array
     */
    abstract readFile(file: File): Promise<TRawData[]>

    /**
     * Transform provider-specific raw data into canonical StreamRecord format
     *
     * @param rawData - Raw data from provider's export file
     * @returns Array of normalized stream records
     */
    abstract transform(rawData: TRawData[]): StreamRecord[]

    /**
     * Validate stream records and filter out invalid ones
     *
     * @param records - Records to validate
     * @returns Array of valid stream records
     */
    private validate(records: Partial<StreamRecord>[]): StreamRecord[] {
        return records.filter(isValidStreamRecord)
    }

    /**
     * Filter stream records based on provider-specific criteria
     * Default implementation filters out streams shorter than 30 seconds
     *
     * @param records - Valid stream records to filter
     * @returns Filtered stream records
     */
    private filter(records: StreamRecord[]): StreamRecord[] {
        return records.filter(isLongEnoughStream)
    }

    /**
     * Process a file through the complete data pipeline
     *
     * @param file - File to process
     * @returns Promise resolving to validated and filtered stream records
     */
    async processFile(file: File): Promise<StreamRecord[]> {
        const rawData = await this.readFile(file)
        const transformedData = this.transform(rawData)
        const validatedData = this.validate(transformedData)
        const filteredData = this.filter(validatedData)
        return filteredData
    }
}
