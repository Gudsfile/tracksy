import { getDB } from '../getDB'
import { tableFromJSON, Table } from 'apache-arrow'

export type Results = {
    master_metadata_track_name: string
    total_ms_played: number
    count_play: number
}[]

const { conn } = await getDB()
const TABLE = 'spotitable'

const DROP_TABLE_QUERY = `DROP TABLE IF EXISTS ${TABLE}`
const TRACK_METRICS_QUERY = `
WITH
metrics_by_track AS (
    SELECT
        spotify_track_uri,
        sum(ms_played)::int AS total_ms_played,
        count(*)::int as count_play
    FROM ${TABLE}
    GROUP BY spotify_track_uri
)
SELECT
    master_metadata_track_name,
    total_ms_played,
    count_play
FROM ${TABLE}
INNER JOIN metrics_by_track USING (spotify_track_uri)
GROUP BY ALL
ORDER BY
    count_play DESC,
    total_ms_played DESC,
    master_metadata_track_name ASC
`

export async function queryFilesInDatabase(
    files: FileList
): Promise<Results | undefined> {
    if (files.length < 1) {
        console.error('No data')
        throw new Error('No data to process')
    }

    const file = files[0]
    console.warn('Multiple file processing is not yet implemented.')
    console.warn(`Only ${file.name} is taken into account.`)

    await conn.query(DROP_TABLE_QUERY)

    const rawContent = await file.text()
    const jsonContent = JSON.parse(rawContent)
    const arrowTableContent = tableFromJSON(jsonContent)
    await conn.insertArrowTable(arrowTableContent, { name: TABLE })

    const results = await conn.query(TRACK_METRICS_QUERY)
    return results.toArray().map((row) => row.toJSON())
}

const TRACK_METRICS_BY_DATE = `
SELECT
  ms_played,
  ts::date as ts,
  username
FROM ${TABLE}
order by ts
`

export async function queryDb(): Promise<Table<any> | undefined> {
    const results = await conn.query(TRACK_METRICS_BY_DATE)
    return results
}
