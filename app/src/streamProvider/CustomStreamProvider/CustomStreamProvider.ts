import { getDB } from '../../db/getDB'
import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { CustomRawRecord } from './types'

const TMP_FILE_NAME = '_custom_tmp.csv'

export class CustomStreamProvider extends StreamProvider<CustomRawRecord> {
    readonly name = 'custom'
    readonly displayName = 'Custom'
    readonly acceptedFormats = 'CSV'
    readonly filePattern = /^tracksy-custom\.csv$/i
    readonly fileContentType = 'text/csv'

    async readFile(file: File): Promise<CustomRawRecord[]> {
        const buffer = await file.arrayBuffer()
        const { db, conn } = await getDB()

        await db.registerFileBuffer(TMP_FILE_NAME, new Uint8Array(buffer))
        try {
            const result = await conn.query(
                `SELECT * FROM read_csv('${TMP_FILE_NAME}', header=true, all_varchar=true)`
            )
            return result
                .toArray()
                .map((row) => row.toJSON() as CustomRawRecord)
        } catch (error) {
            throw new Error(
                'Failed to parse custom CSV. Check that the file has all required columns: ts, track_name, artist_name, album_name, ms_played, track_uri, platform.',
                { cause: error }
            )
        } finally {
            await db.dropFile(TMP_FILE_NAME)
        }
    }

    transform(rawData: CustomRawRecord[]): StreamRecord[] {
        return rawData.flatMap((r) => {
            const ts = r.ts != null ? String(r.ts) : undefined
            const track_uri =
                r.track_uri != null ? String(r.track_uri) : undefined
            if (ts === undefined || track_uri === undefined) return []
            return [
                {
                    ts,
                    track_uri,
                    track_name: String(r.track_name ?? 'Unknown Track'),
                    artist_name: String(r.artist_name ?? 'Unknown Artist'),
                    album_name: String(r.album_name ?? 'Unknown Album'),
                    ms_played: Math.max(0, Number(r.ms_played) || 0),
                    platform: String(r.platform ?? 'Unknown Device'),
                },
            ]
        })
    }
}
