import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    datasetFingerprint,
    describeFingerprint,
    NO_DATASET,
} from './fingerprint'
import * as queryDBModule from '../../db/queries/queryDB'

const SUMMARY = {
    row_count: 12_345,
    first_stream: '2021-03-04 10:00:00',
    last_stream: '2025-11-30 23:59:00',
    artist_count: 678,
}

beforeEach(() => {
    vi.restoreAllMocks()
})

describe('datasetFingerprint', () => {
    it('summarises the loaded dataset', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([SUMMARY])

        await expect(datasetFingerprint()).resolves.toEqual({
            id: '12345|2021-03-04 10:00:00|2025-11-30 23:59:00|678',
            rowCount: 12_345,
            firstStream: '2021-03-04 10:00:00',
            lastStream: '2025-11-30 23:59:00',
            artistCount: 678,
        })
    })

    it('gives the same id for the same data', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([SUMMARY])

        const first = await datasetFingerprint()
        const second = await datasetFingerprint()

        expect(first.id).toBe(second.id)
    })

    it('changes the id when the data changes', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([SUMMARY])
        const before = await datasetFingerprint()

        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([
            { ...SUMMARY, row_count: 12_346 },
        ])
        const after = await datasetFingerprint()

        // This is the whole point: a differing id suppresses the delta view
        // rather than reporting a dataset change as a model regression.
        expect(after.id).not.toBe(before.id)
    })

    it('reports no dataset when the table is missing', async () => {
        // The normal state before any file is loaded — not an error.
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValue(
            new Error('Table with name music_streams does not exist')
        )

        await expect(datasetFingerprint()).resolves.toEqual(NO_DATASET)
    })

    it('reports no dataset when the table exists but is empty', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([
            {
                row_count: 0,
                first_stream: null,
                last_stream: null,
                artist_count: 0,
            },
        ])

        await expect(datasetFingerprint()).resolves.toEqual(NO_DATASET)
    })

    it('reports no dataset when the query returns nothing at all', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([])

        await expect(datasetFingerprint()).resolves.toEqual(NO_DATASET)
    })
})

describe('describeFingerprint', () => {
    it('reads as a summary a human can check against their data', () => {
        expect(
            describeFingerprint({
                id: 'x',
                rowCount: 12_345,
                firstStream: '2021-03-04 10:00:00',
                lastStream: '2025-11-30 23:59:00',
                artistCount: 678,
            })
        ).toBe('12,345 streams · 678 artists · 2021-03-04 → 2025-11-30')
    })

    it('omits the date range when it is unknown', () => {
        expect(
            describeFingerprint({
                id: 'x',
                rowCount: 5,
                firstStream: null,
                lastStream: null,
                artistCount: 2,
            })
        ).toBe('5 streams · 2 artists')
    })

    it('says plainly when nothing is loaded', () => {
        expect(describeFingerprint(NO_DATASET)).toBe('no dataset loaded')
    })
})
