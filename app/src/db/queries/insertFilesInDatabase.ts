import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'
import { tableFromJSON } from 'apache-arrow'
import { detectProvider } from '../../streamProvider'
import type { StreamRecord } from '../../streamProvider/types'

export async function insertFilesInDatabase(files: FileList) {
    if (files.length < 1) {
        console.error('No file to process')
        throw new Error('No file to process')
    }

    const allStreamRecords: StreamRecord[] = []

    for (const file of Array.from(files)) {
        console.debug(`File ${file.name} is being processed.`)

        // Detect which provider this file is from
        const provider = detectProvider(file)
        if (!provider) {
            console.warn(
                `File ${file.name} does not match any known provider. Skipping.`
            )
            continue
        }

        console.debug(
            `File ${file.name} detected as ${provider.displayName} format.`
        )

        // Read using the appropriate provider
        const records = await provider.processFile(file)

        allStreamRecords.push(...records)
    }

    if (allStreamRecords.length === 0) {
        console.error('No valid stream records found')
        throw new Error('No valid stream records found')
    }

    const arrowTableContent = tableFromJSON(allStreamRecords)

    const { conn } = await getDB()

    await conn.query(DROP_TABLE_QUERY)
    console.debug(`Table ${TABLE} dropped.`)

    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })
    console.debug(
        `Table ${TABLE} created with ${allStreamRecords.length} records.`
    )
}
