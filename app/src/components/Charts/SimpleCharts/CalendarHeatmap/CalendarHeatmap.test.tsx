import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CalendarHeatmap } from './CalendarHeatmap'

describe('CalendarHeatmap', () => {
    it('renders placeholder when year is undefined', () => {
        render(<CalendarHeatmap data={undefined} year={undefined} />)
        screen.getByText('Select a year to view the calendar')
    })

    it('renders empty state when data is undefined', () => {
        render(
            <CalendarHeatmap data={undefined} year={2025} isLoading={false} />
        )
        screen.getByText('No data for this year')
    })

    it('shows the year in the card title', () => {
        render(<CalendarHeatmap data={[]} year={2024} />)
        screen.getByText(/Listening activity 2024/)
    })

    it('renders cells for the full year including leading/trailing nulls', () => {
        const data = [{ day: '2025-06-15', stream_count: 5 }]
        const { container } = render(
            <CalendarHeatmap data={data} year={2025} />
        )
        // 365 days + 2 leading nulls (Jan 1 is Wed) + 4 trailing nulls (Dec 31 is Wed)
        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        expect(cells.length).toBe(371)
    })
})
