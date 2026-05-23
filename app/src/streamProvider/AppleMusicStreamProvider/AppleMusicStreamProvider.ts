import { getDB } from '../../db/getDB'
import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { AppleMusicRawRecord } from './types'

const TMP_FILE_NAME = '_apple_music_tmp.csv'

export class AppleMusicStreamProvider extends StreamProvider<AppleMusicRawRecord> {
    readonly name = 'apple-music'
    readonly displayName = 'Apple Music'
    readonly acceptedFormats = 'ZIP/CSV'
    readonly filePattern = /^Apple Music Play Activity\.csv$/i
    readonly fileContentType = 'text/csv'

    async readFile(file: File): Promise<AppleMusicRawRecord[]> {
        const buffer = await file.arrayBuffer()
        const { db, conn } = await getDB()

        await db.registerFileBuffer(TMP_FILE_NAME, new Uint8Array(buffer))
        try {
            const result = await conn.query(
                `SELECT * FROM read_csv('${TMP_FILE_NAME}', header=true)`
            )
            return result
                .toArray()
                .map((row) => row.toJSON() as AppleMusicRawRecord)
        } finally {
            await db.dropFile(TMP_FILE_NAME)
        }
    }

    transform(rawData: AppleMusicRawRecord[]): StreamRecord[] {
        return rawData
            .filter(
                (r) =>
                    r['Media Type'] === 'AUDIO' &&
                    r['Container Origin Type'] !== 'STREAM_RADIO_STATION'
            )
            .map((r) => {
                const tsRaw = r['Event Start Timestamp']
                const ts =
                    tsRaw instanceof Date
                        ? tsRaw.toISOString()
                        : typeof tsRaw === 'number' || typeof tsRaw === 'bigint'
                          ? new Date(Number(tsRaw)).toISOString()
                          : String(tsRaw ?? '')
                const msDuration = Number(r['Play Duration Milliseconds']) || 0
                return {
                    track_uri: `apple-music:${String(r['Song Name'] ?? '')}`,
                    track_name: String(r['Song Name'] ?? ''),
                    artist_name: '',
                    album_name: String(r['Album Name'] ?? ''),
                    ts,
                    ms_played: Math.max(0, msDuration),
                    platform: String(r['Client Platform'] ?? ''),
                }
            })
    }
}
