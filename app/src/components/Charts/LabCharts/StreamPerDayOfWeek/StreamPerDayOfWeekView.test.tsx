import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreamPerDayOfWeekView } from './StreamPerDayOfWeekView'
import type { StreamPerDayOfWeekQueryResult } from './query'

const sampleData: StreamPerDayOfWeekQueryResult[] = [
    {
        stream_date_ts: 1000,
        day_of_week: 0,
        play_hour: 10,
        cumulative_count: 1,
    },
    {
        stream_date_ts: 1000,
        day_of_week: 3,
        play_hour: 22,
        cumulative_count: 3,
    },
]

describe('StreamPerDayOfWeekView', () => {
    it('renders chart title', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        screen.getByText(/Listening Bingo/)
    })

    it('renders the question subtitle', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        screen.getByText('Have you listened at every hour of every day?')
    })

    it('renders grid even when data is empty', () => {
        const { container } = render(<StreamPerDayOfWeekView data={[]} />)
        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        expect(cells).toHaveLength(168)
    })

    it('renders grid when data is undefined', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={undefined} />
        )
        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        expect(cells).toHaveLength(168)
    })

    it('renders sparse day labels', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        screen.getByText('Mon')
        screen.getByText('Wed')
        screen.getByText('Fri')
    })

    it('renders sparse hour labels at multiples of 6', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        screen.getByText('0')
        screen.getByText('6')
        screen.getByText('12')
        screen.getByText('18')
    })

    it('renders 168 cells (7 days x 24 hours)', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={sampleData} />
        )
        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        expect(cells).toHaveLength(168)
    })
})
