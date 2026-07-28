import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import type { Top10TracksEvolutionQueryResult } from './query'

import { Top10TracksEvolution } from '.'

const ERROR_MESSAGE = 'Failed to load chart data'

const queryResult: Top10TracksEvolutionQueryResult[] = [
    {
        stream_year: 2020,
        track: 'Track A',
        artist: 'Artist A',
        stream_rank: 1,
        play_count: 100,
    },
    {
        stream_year: 2021,
        track: 'Track A',
        artist: 'Artist A',
        stream_rank: 2,
        play_count: 90,
    },
]

describe('Top10TracksEvolution Component', () => {
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

        const { container } = render(<Top10TracksEvolution />)

        await waitFor(() => {
            expect(container.querySelector('svg')).toBeTruthy()
        })
    })

    it('shows an error indication when the query throws', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB failure')
        )

        render(<Top10TracksEvolution />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
        expect(consoleSpy).toHaveBeenCalled()
    })
})
