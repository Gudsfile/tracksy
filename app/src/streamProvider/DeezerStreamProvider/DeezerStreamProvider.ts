import { getDB } from '../../db/getDB'
import { StreamProvider } from '../StreamProvider'
import type { StreamRecord } from '../types'
import type { DeezerRawStreamRecord } from './types'

const SHEET_NAME = '10_listeningHistory'
const TMP_FILE_NAME = '_deezer_tmp.xlsx'

export class DeezerStreamProvider extends StreamProvider<DeezerRawStreamRecord> {
    name = 'deezer'
    displayName = 'Deezer'
    filePattern = /^deezer-data_\d{10}\.xlsx$/i
    fileContentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    async readFile(file: File): Promise<DeezerRawStreamRecord[]> {
        const buffer = await file.arrayBuffer()
        const { db, conn } = await getDB()

        await db.registerFileBuffer(TMP_FILE_NAME, new Uint8Array(buffer))
        try {
            const result = await conn.query(
                `SELECT * FROM read_xlsx('${TMP_FILE_NAME}', sheet='${SHEET_NAME}')`
            )
            return result
                .toArray()
                .map((row) => row.toJSON() as DeezerRawStreamRecord)
        } catch (error) {
            throw new Error(
                `Failed to read Deezer export: sheet "${SHEET_NAME}" not found. ` +
                    `Make sure the file is a valid Deezer listening history export.`,
                { cause: error }
            )
        } finally {
            await db.dropFile(TMP_FILE_NAME)
        }
    }

    transform(rawData: DeezerRawStreamRecord[]): StreamRecord[] {
        return rawData.map((raw) => {
            const listeningTime = Number(raw['Listening Time']) || 0
            const msPlayed = listeningTime > 0 ? listeningTime * 1000 : 0
            return {
                track_uri: raw['ISRC'],
                track_name: raw['Song Title'],
                artist_name: raw['Artist'],
                album_name: raw['Album Title'],
                ts: raw['Date'].replace(' ', 'T') + 'Z',
                ms_played: msPlayed,
                ip_addr: raw['IP Address'],
                platform: raw['Platform Name'],
            }
        })
    }
}
