import { getDB } from '../../db/getDB'
import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { AppleMusicRawRecord } from './types'

const TMP_FILE_NAME = '_apple_music_tmp.csv'

function parseOffset(raw: unknown): number | null {
    if (raw == null || raw === '') return null
    const offset = Number(raw)
    return Number.isFinite(offset) ? offset : null
}

// Local listening time as ISO 8601 with its offset, e.g. 2024-01-15T12:00:00.000+02:00
function toLocalIso(utc: Date, offsetSec: number): string {
    const local = new Date(utc.getTime() + offsetSec * 1000)
        .toISOString()
        .slice(0, -1)
    const abs = Math.abs(offsetSec)
    const hours = String(Math.floor(abs / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((abs % 3600) / 60)).padStart(2, '0')
    return `${local}${offsetSec < 0 ? '-' : '+'}${hours}:${minutes}`
}

export class AppleMusicStreamProvider extends StreamProvider<AppleMusicRawRecord> {
    readonly name = 'apple-music'
    readonly displayName = 'Apple Music'
    readonly acceptedFormats = 'ZIP/CSV'
    readonly filePattern = /^Apple Music Play Activity\.csv$/i
    readonly fileContentType = 'text/csv'
    readonly experimental = true

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
                const utcTs =
                    tsRaw instanceof Date
                        ? tsRaw.toISOString()
                        : typeof tsRaw === 'number' || typeof tsRaw === 'bigint'
                          ? new Date(Number(tsRaw)).toISOString()
                          : String(tsRaw ?? '')
                const utc = new Date(utcTs)
                const offsetSec = parseOffset(r['UTC Offset In Seconds'])
                const ts =
                    offsetSec !== null && !Number.isNaN(utc.getTime())
                        ? toLocalIso(utc, offsetSec)
                        : utcTs
                const msDuration = Number(r['Play Duration Milliseconds']) || 0
                return {
                    track_uri: `apple-music:${String(r['Song Name'] ?? '')}`,
                    track_name: String(r['Song Name'] ?? ''),
                    artist_name: 'Unknown Artist',
                    album_name:
                        r['Album Name'] != null
                            ? String(r['Album Name'])
                            : 'Unknown Album',
                    ts,
                    ms_played: Math.max(0, msDuration),
                    platform:
                        r['Device Type'] != null
                            ? String(r['Device Type'])
                            : 'Unknown Device',
                }
            })
    }
}
