import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Charts } from './Charts'

vi.mock('./StreamPerMonth', () => ({
    StreamPerMonth: () => <div data-testid="stream-per-month" />,
}))

vi.mock('./StreamPerHour', () => ({
    StreamPerHour: () => <div data-testid="stream-per-hour" />,
}))

vi.mock('./SummaryPerYear', () => ({
    SummaryPerYear: () => <div data-testid="summary-per-year" />,
}))

vi.mock('./TopTracks', () => ({
    TopTracks: () => <div data-testid="top-tracks" />,
}))

vi.mock('../RangeSlider/RangeSlider', () => ({
    RangeSlider: () => <div data-testid="range-slider" />,
}))

vi.mock('../../db/queries/queryDB', () => ({
    queryDBAsJSON: vi.fn(() => [
        {
            min_datetime: 'dateA',
            max_datetime: 'dateB',
            max_count_hourly_stream: 10,
        },
    ]),
}))

describe('Charts Component', () => {
    it('renders all Charts', async () => {
        render(<Charts />)

        await waitFor(() => {
            screen.getByTestId('range-slider')
            screen.getByTestId('stream-per-hour')
            screen.getByTestId('stream-per-month')
            screen.getByTestId('summary-per-year')
            screen.getByTestId('top-tracks')
        })
    })
})
