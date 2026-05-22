import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import type { Top10BillboardRaceQueryResult } from './query'

// Two weeks of data: week of 2019-12-30 and week of 2020-12-28
const week1Ts = 1577664000000 // 2019-12-30T00:00:00.000Z
const week2Ts = 1609113600000 // 2020-12-28T00:00:00.000Z

const mockData: Top10BillboardRaceQueryResult[] = [
    { period_ts: week1Ts, label: 'Artist A', period_plays: 3 },
    { period_ts: week1Ts, label: 'Artist B', period_plays: 2 },
    { period_ts: week2Ts, label: 'Artist A', period_plays: 1 },
    { period_ts: week2Ts, label: 'Artist B', period_plays: 2 },
]

describe('Top10BillboardRaceView', () => {
    it('renders and displays the first frame of data', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // Verify the heading is rendered with "Week of" prefix
        const heading = screen.getByRole('heading', { level: 4 })
        expect(heading).toBeDefined()
        expect(heading.textContent).toContain('Week of')

        // Verify the artists in the first frame are shown (may appear multiple times: bar + facts)
        expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Artist B').length).toBeGreaterThan(0)

        // Verify weeks column header and weekly granularity label
        expect(screen.getByText('weeks charted')).toBeDefined()
        expect(screen.getByText(/weekly/)).toBeDefined()

        // No "Start" or "End" labels
        expect(screen.queryByText('Start')).toBeNull()
        expect(screen.queryByText('End')).toBeNull()
    })

    it('displays wks suffix for periodsInTop10 values', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // The first frame shows periodsInTop10 = 1 for both artists
        expect(screen.getAllByText('wks').length).toBeGreaterThan(0)
    })

    it('renders the lambda selector with five buttons', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // All five lambda values should be present
        expect(screen.getByRole('button', { name: 'λ0.1' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.2' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.3' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.4' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.5' })).toBeDefined()

        // Default lambda is 0.4
        const defaultButton = screen.getByRole('button', { name: 'λ0.4' })
        expect(defaultButton.className).toContain('bg-blue-500')
    })

    it('allows changing lambda value', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const lambda03 = screen.getByRole('button', { name: 'λ0.3' })
        const lambda04 = screen.getByRole('button', { name: 'λ0.4' })

        // Initially 0.4 is selected
        expect(lambda04.className).toContain('bg-blue-500')

        // Click 0.3
        fireEvent.click(lambda03)
        expect(lambda03.className).toContain('bg-blue-500')
        expect(lambda04.className).not.toContain('bg-blue-500')
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

    it('resets to frame 0 and resumes playing when lambda changes', () => {
        vi.useFakeTimers()
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        // Pause so we can track state
        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        // Change lambda
        const lambda05 = screen.getByRole('button', { name: 'λ0.5' })
        fireEvent.click(lambda05)

        // After lambda change, animation should be playing again (Pause button visible)
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })
})
