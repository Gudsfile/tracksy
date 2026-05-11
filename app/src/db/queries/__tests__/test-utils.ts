import { vi } from 'vitest'

import * as db from '../../getDB'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'

import type { StreamRecord } from '../../../streamProvider/types'
import { StreamProvider } from '../../../streamProvider/StreamProvider'

export function mockDB() {
    const connectionMock = {
        query: vi.fn().mockResolvedValue({}),
        insertArrowTable: vi.fn().mockResolvedValue({}),
    } as unknown as AsyncDuckDBConnection

    vi.spyOn(db, 'getDB').mockResolvedValue({
        conn: connectionMock,
        db: {} as unknown as AsyncDuckDB,
    })

    return connectionMock
}

export function mockStreamProviderWithSpy(records: StreamRecord[]) {
    const provider = new (class extends StreamProvider {
        readonly name = 'test'
        readonly displayName = 'Test Provider'
        readonly filePattern = /test\.json$/
        readonly fileContentType = 'application/json'

        readFile = vi.fn(async () => records)
        transform = vi.fn((raw) => raw as StreamRecord[])
    })()

    const processFileSpy = vi.spyOn(provider, 'processFile')

    return { provider, processFileSpy }
}
