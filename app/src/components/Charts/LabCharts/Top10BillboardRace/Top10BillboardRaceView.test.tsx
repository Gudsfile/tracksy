import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import type { Top10BillboardRaceQueryResult } from './query'

// Two weeks of data: week of 2019-12-30 and week of 2020-12-28
const week1Ts = 1577664000000 // 2019-12-30T00:00:00.000Z
const week2Ts = 1609113600000 // 2020-12-28T00:00:00.000Z

const mockData: Top10BillboardRaceQueryResult[] = [
    { period_ts: week1Ts, label: 'Artist A', periods_in_top10: 1 },
    { period_ts: week1Ts, label: 'Artist B', periods_in_top10: 1 },
    { period_ts: week2Ts, label: 'Artist A', periods_in_top10: 2 },
    { period_ts: week2Ts, label: 'Artist B', periods_in_top10: 2 },
]

describe('Top10BillboardRaceView', () => {
    it('renders and displays the first frame of data', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // Verify the heading is rendered with "Week of" prefix
        const heading = screen.getByRole('heading', { level: 4 })
        expect(heading).toBeDefined()
        expect(heading.textContent).toContain('Week of')

        // Verify the artists in the first frame are shown
        expect(screen.getByText('Artist A')).toBeDefined()
        expect(screen.getByText('Artist B')).toBeDefined()

        // Verify weeks column header and weekly granularity label
        expect(screen.getByText('weeks in top 10')).toBeDefined()
        expect(screen.getByText(/weekly/)).toBeDefined()

        // No "Start" or "End" labels
        expect(screen.queryByText('Start')).toBeNull()
        expect(screen.queryByText('End')).toBeNull()
    })

    it('displays wks suffix for periods_in_top10 values', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // The first frame shows periods_in_top10 = 1 for both artists
        expect(screen.getAllByText('wks').length).toBeGreaterThan(0)
    })

    it('allows changing animation speed', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // Initially speed 1x is selected
        const speed1xButton = screen.getByRole('button', { name: '1x' })
        expect(speed1xButton.className).toContain('bg-blue-500')

        // Click on 2x
        const speed2xButton = screen.getByRole('button', { name: '2x' })
        fireEvent.click(speed2xButton)
        expect(speed2xButton.className).toContain('bg-blue-500')
        expect(speed1xButton.className).not.toContain('bg-blue-500')
    })

    it('allows pausing/playing the animation', () => {
        vi.useFakeTimers()
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // Initially it should be playing. Let's pause it.
        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        // Play again
        const playButton = screen.getByRole('button', { name: 'Play' })
        fireEvent.click(playButton)
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })

    it('resets to frame 0 and resumes playing when entityType changes', () => {
        vi.useFakeTimers()
        const { rerender } = render(
            <Top10BillboardRaceView data={mockData} entityType="artists" />
        )

        // Pause so we can track frame position
        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)

        // Re-render with a new entityType
        rerender(<Top10BillboardRaceView data={mockData} entityType="tracks" />)

        // After entityType change, animation should be playing again (Pause button visible)
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })
})
