import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Results } from './Results'
import * as db from '../../db/queries/queryDB'
import {
    summarizeQuery,
    type SummarizeDataQueryResult,
} from '../Charts/summarizeQuery'

const summarizedDataMock: SummarizeDataQueryResult[] = [
    {
        max_count_hourly_stream: 1234,
        max_datetime: '1734134400000',
        max_monthly_duration: 39959692,
        min_datetime: '1704067200000',
    },
]

beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vi.spyOn(db, 'queryDBAsJSON').mockImplementation((query) => {
        if (query === summarizeQuery) return Promise.resolve(summarizedDataMock)
    })
})

it('renders properly', () => {
    render(<Results />)
    // Check that both buttons are rendered
    screen.getByRole('button', { name: 'Simple View' })
    screen.getByRole('button', { name: 'Expert View' })
})

it('switches to simple view when Simple View button is clicked', async () => {
    render(<Results />)
    const simpleButton = screen.getByRole('button', {
        name: 'Simple View',
    })

    fireEvent.click(simpleButton)

    // Simple view content should be visible
    screen.getByText('simple view')
    // Charts component should not be visible
    await waitFor(() => {
        expect(screen.queryByRole('slider')).toBeNull()
    })
})

it('switches to expert view when Expert View button is clicked', async () => {
    render(<Results />)

    // First switch to simple view
    const simpleButton = screen.getByRole('button', {
        name: 'Simple View',
    })
    fireEvent.click(simpleButton)

    // Then switch back to expert view
    const expertButton = screen.getByRole('button', {
        name: 'Expert View',
    })
    fireEvent.click(expertButton)

    // Charts component should be visible again
    const slider = await screen.findByRole('slider')

    await waitFor(() => {
        expect(slider.getAttribute('value')).toEqual('2024')
    })
    // Simple view content should not be visible
    expect(screen.queryByText('simple view')).toBeNull()
})
