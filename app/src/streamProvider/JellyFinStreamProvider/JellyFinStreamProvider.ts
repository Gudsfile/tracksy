import { getDB } from '../../db/getDB'
import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { JellyFinRawRecord } from './types'

const TMP_FILE_NAME = '_jellyfin_tmp.csv'

export class JellyFinStreamProvider extends StreamProvider<JellyFinRawRecord> {
    readonly name = 'jellyfin'
    readonly displayName = 'JellyFin'
    readonly acceptedFormats = 'CSV'
    readonly filePattern = /^playback_report\.csv$/i
    readonly fileContentType = 'text/csv'

    async readFile(file: File): Promise<JellyFinRawRecord[]> {
        const buffer = await file.arrayBuffer()
        const { db, conn } = await getDB()

        await db.registerFileBuffer(TMP_FILE_NAME, new Uint8Array(buffer))
        try {
            const result = await conn.query(
                `SELECT * FROM read_csv('${TMP_FILE_NAME}', header=true)`
            )
            return result
                .toArray()
                .map((row) => row.toJSON() as JellyFinRawRecord)
        } finally {
            await db.dropFile(TMP_FILE_NAME)
        }
    }

    transform(rawData: JellyFinRawRecord[]): StreamRecord[] {
        return rawData
            .filter((r) => r.ItemType === 'Audio')
            .map((r) => {
                const seconds = Number(r.PlayDuration)
                return {
                    track_uri: `jellyfin:${r.ItemId}`,
                    track_name: r.ItemName,
                    artist_name: '',
                    album_name: '',
                    ts: r.DateCreated.replace(' ', 'T') + 'Z',
                    ms_played: seconds > 0 ? seconds * 1000 : 0,
                    platform: r.ClientName,
                }
            })
    }
}
