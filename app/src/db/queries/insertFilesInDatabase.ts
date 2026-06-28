import { getDB } from '../getDB'
import { RAW_TABLE } from './constants'
import { tableFromJSON } from 'apache-arrow'
import { detectProvider } from '../../streamProvider'
import type { StreamRecord } from '../../streamProvider/types'
import { precomputeDerivedTables } from '../precompute'
import { dispatchDataLoaded } from '../dataSignal'

type OnProgress = (stage: string, percent: number) => void

export async function insertFilesInDatabase(
    files: FileList,
    onProgress?: OnProgress
) {
    if (files.length < 1) {
        console.error('No file to process')
        throw new Error('No file to process')
    }

    const allStreamRecords: StreamRecord[] = []
    const fileArray = Array.from(files)

    for (const [index, file] of fileArray.entries()) {
        console.debug(`File ${file.name} is being processed.`)
        onProgress?.(
            'Parsing records…',
            Math.round((index / fileArray.length) * 50)
        )

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

        const records = await provider.processFile(file)
        allStreamRecords.push(...records)
    }
    onProgress?.('Parsing records…', 50)

    if (allStreamRecords.length === 0) {
        console.error('No valid stream records found')
        throw new Error('No valid stream records found')
    }

    const arrowTableContent = tableFromJSON(allStreamRecords)

    const { conn } = await getDB()

    onProgress?.('Loading into database…', 50)
    await conn.query(`DROP TABLE IF EXISTS ${RAW_TABLE}`)
    console.debug(`Table ${RAW_TABLE} dropped.`)

    await conn.insertArrowTable(arrowTableContent, {
        name: RAW_TABLE,
        create: true,
    })
    console.debug(
        `Table ${RAW_TABLE} created with ${allStreamRecords.length} records.`
    )
    onProgress?.('Loading into database…', 70)

    await precomputeDerivedTables(conn, undefined, (_stage, pct) =>
        onProgress?.('Computing statistics…', 70 + Math.round(pct * 0.3))
    )
    dispatchDataLoaded()
}
