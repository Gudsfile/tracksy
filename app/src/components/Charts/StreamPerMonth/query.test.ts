import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    it,
    expect,
    vi,
} from 'vitest'
import { DuckDBConnection } from '@duckdb/node-api'
import { queryByYear } from './query'
import { TABLE } from '../../../db/queries/constants'

const seedPath = 'src/components/Charts/StreamPerMonth/fixtures/seed.json'
let conn: DuckDBConnection

beforeAll(async () => {
    conn = await DuckDBConnection.create()

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15'))
})

afterAll(() => {
    conn.closeSync()
    vi.useRealTimers()
})

beforeEach(async () => {
    await conn.run(`CREATE OR REPLACE TABLE ${TABLE} AS (FROM '${seedPath}')`)
})

function generateExpectedMonths(
    start: string,
    end: string,
    overrides: Record<string, number> = {}
) {
    const startDate = new Date(`${start}T00:00:00Z`)
    const endDate = new Date(`${end}T00:00:00Z`)
    const result: { ts: string; ms_played: number }[] = []

    const currentDate = new Date(startDate.getTime())
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().slice(0, 10)
        result.push({ ts: dateString, ms_played: overrides[dateString] || 0.0 })
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1)
    }
    return result
}

describe('StreamPerMonth query', () => {
    it('returns listening times by date for all years', async () => {
        const result = await conn.runAndReadAll(queryByYear(undefined))
        const rows = result.getRowObjectsJson()

        const expected = generateExpectedMonths('2006-01-01', '2025-12-01', {
            '2006-01-01': 3.3,
            '2006-04-01': 2.2,
            '2006-06-01': 1.1,
            '2006-10-01': 2.2,
            '2006-12-01': 1.1,
            '2025-12-01': 1.1,
        })

        expect(rows).toEqual(expected)
    })

    it('returns listening times by date for a specific year', async () => {
        const result = await conn.runAndReadAll(queryByYear(2006))
        const rows = result.getRowObjectsJson()

        expect(rows).toEqual([
            { ts: '2006-01-01', ms_played: 3.3 },
            { ts: '2006-02-01', ms_played: 0.0 },
            { ts: '2006-03-01', ms_played: 0.0 },
            { ts: '2006-04-01', ms_played: 2.2 },
            { ts: '2006-05-01', ms_played: 0.0 },
            { ts: '2006-06-01', ms_played: 1.1 },
            { ts: '2006-07-01', ms_played: 0.0 },
            { ts: '2006-08-01', ms_played: 0.0 },
            { ts: '2006-09-01', ms_played: 0.0 },
            { ts: '2006-10-01', ms_played: 2.2 },
            { ts: '2006-11-01', ms_played: 0.0 },
            { ts: '2006-12-01', ms_played: 1.1 },
        ])
    })
})
