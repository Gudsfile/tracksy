import { it, expect, vi } from 'vitest'

import * as db from '../getDB'
import { insertFilesInDatabase } from './insertFilesInDatabase'
import { convertArrayToFileList } from '../../utils/convertArrayToFileList'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'

/**
 * Disabled due to JSDOM not supporting full File API : https://developer.mozilla.org/en-US/docs/Web/API/Blob/text
 * missing File.text method
 * https://github.com/jsdom/jsdom/blob/04541b377d9949d6ab56866760b7883a23db0577/lib/jsdom/living/file-api/Blob-impl.js#L11
 */
it.skip('should insert files in database', async () => {
    const connectionMock = {
        query: vi.fn().mockResolvedValue({}),
        insertArrowTable: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection

    vi.spyOn(db, 'getDB').mockResolvedValue({
        conn: connectionMock,
        db: {} as unknown as AsyncDuckDB,
    })

    const filesMock = convertArrayToFileList([
        new File([JSON.stringify({ a: 1 })], 'file1.json'),
        new File([JSON.stringify({ b: 2 })], 'file2.json'),
    ])

    await insertFilesInDatabase(filesMock)

    expect(connectionMock.query).toHaveBeenCalledTimes(1)
    expect(connectionMock.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS files'
    )
})
