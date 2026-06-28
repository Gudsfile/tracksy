import { getDB } from '../getDB'
import { RAW_TABLE } from './constants'
import { tableFromJSON } from 'apache-arrow'
import { detectProvider } from '../../streamProvider'
import { precomputeDerivedTables } from '../precompute'
import { dispatchDataLoaded } from '../dataSignal'

type OnProgress = (stage: string, percent: number) => void

export async function insertUrlInDatabase(
    jsonUrl: URL,
    onProgress?: OnProgress
) {
    onProgress?.('Fetching demo data…', 0)
    const response = await fetch(jsonUrl.toString())
    if (!response.ok) {
        throw new Error(`Failed to fetch demo data: ${response.statusText}`)
    }

    const blob = await response.blob()
    const filename = jsonUrl.pathname.split('/').pop() || 'streaming_data.json'
    const file = new File([blob], filename, { type: 'application/json' })
    onProgress?.('Fetching demo data…', 25)

    const provider = detectProvider(file)
    if (!provider) {
        throw new Error('No provider found for the demo data URL')
    }

    onProgress?.('Parsing records…', 25)
    const records = await provider.processFile(file)

    if (records.length === 0) {
        throw new Error('No valid stream records found in demo data')
    }
    onProgress?.('Parsing records…', 50)

    const arrowTableContent = tableFromJSON(records)

    const { conn } = await getDB()
    onProgress?.('Loading into database…', 50)
    await conn.query(`DROP TABLE IF EXISTS ${RAW_TABLE}`)
    await conn.insertArrowTable(arrowTableContent, {
        name: RAW_TABLE,
        create: true,
    })
    onProgress?.('Loading into database…', 70)

    await precomputeDerivedTables(conn, undefined, (_stage, pct) =>
        onProgress?.('Computing statistics…', 70 + Math.round(pct * 0.3))
    )
    dispatchDataLoaded()
}
