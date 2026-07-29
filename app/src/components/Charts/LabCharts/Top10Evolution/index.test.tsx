import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { dispatchDataLoaded } from '../../../../db/dataSignal'
import type { Top10EvolutionQueryResult } from './query'

import { Top10Evolution } from '.'

const ERROR_MESSAGE = 'DB failure'

const queryResult: Top10EvolutionQueryResult[] = [
    { stream_year: 2020, artist: 'Artist A', stream_rank: 1, play_count: 100 },
    { stream_year: 2021, artist: 'Artist A', stream_rank: 2, play_count: 90 },
]

describe('Top10Evolution Component', () => {
    beforeEach(() => {
        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the plot when data is available', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(queryResult)

        const { container } = render(<Top10Evolution />)

        await waitFor(() => {
            expect(container.querySelector('svg')).toBeTruthy()
        })
    })

    it('shows an error indication when the query throws', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error(ERROR_MESSAGE)
        )

        render(<Top10Evolution />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
        expect(consoleSpy).toHaveBeenCalled()
    })

    it('clears the error on a subsequent successful load', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const querySpy = vi.spyOn(query, 'queryDBAsJSON')
        querySpy.mockRejectedValueOnce(new Error(ERROR_MESSAGE))
        querySpy.mockResolvedValue(queryResult)

        const { container } = render(<Top10Evolution />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })

        await act(async () => {
            dispatchDataLoaded()
        })

        await waitFor(() => {
            expect(container.querySelector('svg')).toBeTruthy()
        })
        expect(screen.queryByText(ERROR_MESSAGE)).toBeNull()
        expect(consoleSpy).toHaveBeenCalled()
    })
})
