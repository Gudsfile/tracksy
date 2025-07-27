import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Charts } from './Charts'
import React from 'react'

vi.mock('./StreamPerMonth', () => ({
    StreamPerMonth: () => <div data-testid="stream-per-month" />,
}))

vi.mock('./StreamPerHour', () => ({
    StreamPerHour: () => <div data-testid="stream-per-hour" />,
}))

vi.mock('./SummaryPerYear', () => ({
    SummaryPerYear: () => <div data-testid="summary-per-year" />,
}))

vi.mock('../RangeSlider/RangeSlider', () => ({
    RangeSlider: () => <div data-testid="range-slider" />,
}))

vi.mock('../../db/queries/queryDB', () => ({
    queryDB: vi.fn(() => ({
        get: (index: number) => ({
            min_datetime: index,
            max_datetime: index,
            max_count_hourly_stream: index,
        }),
    })),
}))

describe('Charts Component', () => {
    it('renders all Charts', async () => {
        render(<Charts />)

        screen.getByTestId('stream-per-month')
        screen.getByTestId('summary-per-year')
        await waitFor(() => {
            screen.getByTestId('stream-per-hour')
            screen.getByTestId('range-slider')
        })
    })
})
