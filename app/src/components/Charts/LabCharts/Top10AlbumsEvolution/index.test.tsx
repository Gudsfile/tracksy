import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { render, screen, waitFor } from '@testing-library/react'

import * as cached from '../../../../db/queries/queryDBCached'
import { dispatchDataLoaded } from '../../../../db/dataSignal'
import type { Top10AlbumsEvolutionQueryResult } from './query'

import { Top10AlbumsEvolution } from '.'

const ERROR_MESSAGE = 'DB failure'

const queryResult: Top10AlbumsEvolutionQueryResult[] = [
    {
        stream_year: 2020,
        album: 'Album A',
        artist: 'Artist A',
        stream_rank: 1,
        play_count: 100,
    },
    {
        stream_year: 2021,
        album: 'Album A',
        artist: 'Artist A',
        stream_rank: 2,
        play_count: 90,
    },
]

describe('Top10AlbumsEvolution Component', () => {
    beforeEach(() => {
        cached.clearQueryCache()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the plot when data is available', async () => {
        vi.spyOn(cached, 'queryDBCached').mockResolvedValue(queryResult)

        const { container } = render(<Top10AlbumsEvolution />)

        await waitFor(() => {
            expect(container.querySelector('svg')).toBeTruthy()
        })
    })

    it('shows an error indication when the query throws', async () => {
        vi.spyOn(cached, 'queryDBCached').mockRejectedValue(
            new Error(ERROR_MESSAGE)
        )

        render(<Top10AlbumsEvolution />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
    })

    it('clears the error on a subsequent successful load', async () => {
        const querySpy = vi.spyOn(cached, 'queryDBCached')
        querySpy.mockRejectedValueOnce(new Error(ERROR_MESSAGE))
        querySpy.mockResolvedValue(queryResult)

        const { container } = render(<Top10AlbumsEvolution />)

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
    })
})
