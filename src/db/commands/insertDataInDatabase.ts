import { getDB } from '../getDB'
import { TABLE } from '../constants'
import { tableFromJSON } from 'apache-arrow'
import { convertFilesToJSON } from '../../utils/convertFilesToJSON'

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`

export async function insertDataInDatabase(
    datasets: Awaited<ReturnType<typeof convertFilesToJSON>>
) {
    const { conn } = await getDB()

    await conn.query(DROP_TABLE_QUERY)
    console.debug(`Table ${TABLE} dropped.`)

    const arrowTableContent = tableFromJSON(datasets)
    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })
}
