import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { type HourlyStreamsQueryResult, buildHourlyStreamsQuery } from './query'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

const testData: TestStreamEntry[] = [
    { ts: '2025-01-01T08:00:00', ms_played: 180000 },
    { ts: '2025-01-01T08:30:00', ms_played: 200000 },
    { ts: '2025-01-01T14:00:00', ms_played: 300000 },
    { ts: '2024-01-01T10:00:00', ms_played: 150000 },
]

describe('HourlyStreams Query', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    beforeEach(async () => {
        await createTestTable(conn, testData)
    })

    it('always returns exactly 24 rows', async () => {
        const rows = (await testQuery(
            conn,
            buildHourlyStreamsQuery(2025)
        )) as unknown as HourlyStreamsQueryResult[]

        expect(rows.length).toBe(24)
    })

    it('returns correct stream count for active hours', async () => {
        const rows = (await testQuery(
            conn,
            buildHourlyStreamsQuery(2025)
        )) as unknown as HourlyStreamsQueryResult[]

        const hour8 = rows.find((r) => r.hour === 8)
        const hour14 = rows.find((r) => r.hour === 14)

        expect(hour8?.count_streams).toBe(2)
        expect(hour14?.count_streams).toBe(1)
    })

    it('returns zero count_streams for hours with no activity', async () => {
        const rows = (await testQuery(
            conn,
            buildHourlyStreamsQuery(2025)
        )) as unknown as HourlyStreamsQueryResult[]

        const hour0 = rows.find((r) => r.hour === 0)
        expect(hour0?.count_streams).toBe(0)
        expect(hour0?.ms_played).toBe(0)
    })

    it('filters by year correctly', async () => {
        const rows2025 = (await testQuery(
            conn,
            buildHourlyStreamsQuery(2025)
        )) as unknown as HourlyStreamsQueryResult[]
        const rows2024 = (await testQuery(
            conn,
            buildHourlyStreamsQuery(2024)
        )) as unknown as HourlyStreamsQueryResult[]

        const total2025 = rows2025.reduce((s, r) => s + r.count_streams, 0)
        const total2024 = rows2024.reduce((s, r) => s + r.count_streams, 0)

        expect(total2025).toBe(3)
        expect(total2024).toBe(1)
    })

    it('includes all years when year is undefined', async () => {
        const rows = (await testQuery(
            conn,
            buildHourlyStreamsQuery(undefined)
        )) as unknown as HourlyStreamsQueryResult[]

        const total = rows.reduce((s, r) => s + r.count_streams, 0)
        expect(total).toBe(4)
    })
})
