import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'
import { tableFromJSON } from 'apache-arrow'
import { detectProvider } from '../../streamProvider'
import { precomputeDerivedTables } from '../precompute'
import { dispatchDataLoaded } from '../dataSignal'

export async function insertUrlInDatabase(jsonUrl: URL) {
    const response = await fetch(jsonUrl.toString())
    if (!response.ok) {
        throw new Error(`Failed to fetch demo data: ${response.statusText}`)
    }

    const blob = await response.blob()
    const filename = jsonUrl.pathname.split('/').pop() || 'streaming_data.json'
    const file = new File([blob], filename, { type: 'application/json' })

    const provider = detectProvider(file)
    if (!provider) {
        throw new Error('No provider found for the demo data URL')
    }

    const records = await provider.processFile(file)

    if (records.length === 0) {
        throw new Error('No valid stream records found in demo data')
    }

    const arrowTableContent = tableFromJSON(records)

    const { conn } = await getDB()
    await conn.query(DROP_TABLE_QUERY)
    await conn.insertArrowTable(arrowTableContent, {
        name: TABLE,
        create: true,
    })

    await precomputeDerivedTables(conn)
    dispatchDataLoaded()
}
