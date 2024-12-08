import { getDB } from '../getDB'
import { TABLE } from './constants'
import { tableFromJSON } from 'apache-arrow'

export type Results = {
    master_metadata_track_name: string
    total_ms_played: number
    count_play: number
}[]

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`

export async function insertFilesInDatabase(files: FileList) {
    if (files.length < 1) {
        console.error('No data')
        throw new Error('No data to process')
    }

    const file = files[0]
    console.warn('Multiple file processing is not yet implemented.')
    console.warn(`Only ${file.name} is taken into account.`)

    const { conn } = await getDB()

    await conn.query(DROP_TABLE_QUERY)

    const rawContent = await file.text()
    const jsonContent = JSON.parse(rawContent)
    const arrowTableContent = tableFromJSON(jsonContent)
    await conn.insertArrowTable(arrowTableContent, { name: TABLE })
}
