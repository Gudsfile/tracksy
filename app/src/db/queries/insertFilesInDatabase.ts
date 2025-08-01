import { getDB } from '../getDB'
import { TABLE } from './constants'
import { tableFromJSON } from 'apache-arrow'

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`

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

const DemoJsonUrl =
    'https://huggingface.co/datasets/tracksy/synthetic-datasets/resolve/main/datasets/spotify/streamings_1000.json'

export async function insertDemoInDatabase() {
    const { conn } = await getDB()
    await conn.query(DROP_TABLE_QUERY)
    console.debug('Table dropped.', { tableName: TABLE })
    await conn.insertJSONFromPath(DemoJsonUrl, { name: TABLE })
    console.debug('Table created.', { tableName: TABLE, withDemoData: true })
}
