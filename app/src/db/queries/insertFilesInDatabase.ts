import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'
import { tableFromJSON } from 'apache-arrow'

export async function insertFilesInDatabase(files: FileList) {
    if (files.length < 1) {
        console.error('No data')
        throw new Error('No data to process')
    }

    const { conn } = await getDB()

    await conn.query(DROP_TABLE_QUERY)
    console.debug(`Table ${TABLE} dropped.`)

    const arrayOfFilesContents: Record<string, unknown>[] = await Promise.all(
        Array.from(files).map(async (file) => {
            console.debug(`File ${file.name} is being processed.`)
            const rawContent = await file.text()
            return JSON.parse(rawContent)
        })
    )

    const arrowTableContent = tableFromJSON(arrayOfFilesContents.flat())
    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })
    console.debug(`Table ${TABLE} created.`)
}
