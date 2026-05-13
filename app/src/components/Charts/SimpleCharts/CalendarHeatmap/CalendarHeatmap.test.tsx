import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
        const data = [{ stream_date: '2025-06-15', stream_count: 5 }]
        const { container } = render(
            <CalendarHeatmap data={data} year={2025} />
        )
        // 365 days + 2 leading nulls (Jan 1 is Wed) + 4 trailing nulls (Dec 31 is Wed)
        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        expect(cells.length).toBe(371)
    })

    it('shows tooltip on cell hover', () => {
        const data = [{ stream_date: '2025-06-15', stream_count: 5 }]
        const { container } = render(
            <CalendarHeatmap data={data} year={2025} />
        )

        const cells = container.querySelectorAll('[style*="aspect-ratio"]')
        const targetCell = Array.from(cells).find((cell) =>
            cell.getAttribute('style')?.includes('background-color')
        ) as HTMLElement | undefined

        expect(targetCell).toBeTruthy()
        fireEvent.mouseEnter(targetCell!)

        screen.getByText(/Jun 15/)
        screen.getByText(/5 streams/)
    })
})
