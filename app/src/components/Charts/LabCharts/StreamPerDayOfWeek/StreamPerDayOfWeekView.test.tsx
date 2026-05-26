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

    it('renders empty state when data is empty', () => {
        render(<StreamPerDayOfWeekView data={[]} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when data is undefined', () => {
        render(<StreamPerDayOfWeekView data={undefined} />)
        screen.getByText('No data for this year')
    })

    it('renders 7 day labels', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
            screen.getByText(day)
        }
    })

    it('renders 24 hour labels', () => {
        render(<StreamPerDayOfWeekView data={sampleData} />)
        expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
        expect(screen.queryByText('24')).toBeNull()
    })

    it('renders 168 cells (7 days x 24 hours)', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={sampleData} />
        )
        const cells = container.querySelectorAll('.aspect-square')
        expect(cells).toHaveLength(168)
    })
})
