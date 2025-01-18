import { getDB } from '../getDB'
import { TABLE } from '../constants'
import { tableFromJSON } from 'apache-arrow'

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`

export async function insertFilesInDatabase(files: FileList | undefined) {
    const { conn } = await getDB()
    let arrayOfFilesContents: Record<string, unknown>[] = []

    if (sessionStorage.getItem('table') === null) {
        if ((files ?? []).length < 1) {
            console.error('No data')
            throw new Error('No data to process')
        }

    await conn.query(DROP_TABLE_QUERY)
    console.debug(`Table ${TABLE} dropped.`)

        arrayOfFilesContents = (
            await Promise.all(
                Array.from(files!).map(async (file) => {
                    console.debug(`File ${file.name} is being processed.`)
                    const rawContent = await file.text()
                    return JSON.parse(rawContent)
                })
            )
        ).flat()

        sessionStorage.setItem('table', JSON.stringify(arrayOfFilesContents))
    } else {
        arrayOfFilesContents = JSON.parse(sessionStorage.getItem('table')!)
    }

    const arrowTableContent = tableFromJSON(arrayOfFilesContents)
    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })
}
