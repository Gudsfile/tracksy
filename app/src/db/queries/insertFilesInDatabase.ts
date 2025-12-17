import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'
import { tableFromJSON } from 'apache-arrow'
import { detectProvider } from '../../adapters'
import type { StreamRecord } from '../../adapters/types'

export async function insertFilesInDatabase(files: FileList) {
    if (files.length < 1) {
        console.error('No data')
        throw new Error('No data to process')
    }

    const { conn } = await getDB()

    await conn.query(DROP_TABLE_QUERY)
    console.debug(`Table ${TABLE} dropped.`)

    const allStreamRecords: StreamRecord[] = []
    console.log(files)

    for (const file of Array.from(files)) {
        console.debug(`File ${file.name} is being processed.`)

        // Detect which provider this file is from
        const adapter = detectProvider(file)
        if (!adapter) {
            console.warn(
                `File ${file.name} does not match any known provider. Skipping.`
            )
            continue
        }

        const metadata = adapter.getMetadata()
        console.debug(
            `File ${file.name} detected as ${metadata.displayName} format.`
        )

        // Read and parse file
        const rawContent = await file.text()
        const rawData = JSON.parse(rawContent)

        // Transform using the appropriate adapter
        const transformedRecords = adapter.transform(rawData)
        allStreamRecords.push(...transformedRecords)
    }

    if (allStreamRecords.length === 0) {
        console.error('No valid stream records found')
        throw new Error('No valid stream records to process')
    }

    const arrowTableContent = tableFromJSON(allStreamRecords)
    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })
    console.debug(
        `Table ${TABLE} created with ${allStreamRecords.length} records.`
    )
}
