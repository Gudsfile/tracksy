import { it, expect, vi } from 'vitest'

import * as db from '../getDB'
import { insertDataInDatabase } from './insertDataInDatabase'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'

it('should insert files in database', async () => {
    const connectionMock = {
        query: vi.fn().mockResolvedValue({}),
        insertArrowTable: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection

    vi.spyOn(db, 'getDB').mockResolvedValue({
        conn: connectionMock,
        db: {} as unknown as AsyncDuckDB,
    })

    await insertDataInDatabase([{ a: 1 }, { b: 2 }])

    expect(connectionMock.query).toHaveBeenCalledTimes(1)
    expect(connectionMock.query).toHaveBeenNthCalledWith(
        1,
        'DROP TABLE IF EXISTS spotitable'
    )

    expect(connectionMock.insertArrowTable).toHaveBeenCalledTimes(1)
})
