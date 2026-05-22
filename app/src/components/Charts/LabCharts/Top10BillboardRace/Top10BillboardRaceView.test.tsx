import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import type { Top10BillboardRaceQueryResult } from './query'

// Two weeks of data: week of 2019-12-30 and week of 2020-12-28
const week1Ts = 1577664000000 // 2019-12-30T00:00:00.000Z
const week2Ts = 1609113600000 // 2020-12-28T00:00:00.000Z

const mockData: Top10BillboardRaceQueryResult[] = [
    { period_ts: week1Ts, entity_name: 'Artist A', period_plays: 3 },
    { period_ts: week1Ts, entity_name: 'Artist B', period_plays: 2 },
    { period_ts: week2Ts, entity_name: 'Artist A', period_plays: 1 },
    { period_ts: week2Ts, entity_name: 'Artist B', period_plays: 2 },
]

describe('Top10BillboardRaceView', () => {
    it('renders and displays the first frame of data', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const heading = screen.getByRole('heading', { level: 4 })
        expect(heading).toBeDefined()
        expect(heading.textContent).toContain('Week of')

        // Artists appear in both bar chart and ghost leaderboard
        expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Artist B').length).toBeGreaterThan(0)

        // Score column header (not weeks)
        expect(screen.getByText('score')).toBeDefined()
        expect(screen.getByText(/weekly/)).toBeDefined()

        expect(screen.queryByText('Start')).toBeNull()
        expect(screen.queryByText('End')).toBeNull()
    })

    it('renders Ghost Leaderboard with longevity data', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        expect(screen.getByText('Longevity Leaderboard')).toBeDefined()

        // Ghost panel shows weeks in top 10 with "w" suffix
        expect(screen.getAllByText(/\dw$/).length).toBeGreaterThan(0)
    })

    it('renders the lambda selector with five buttons', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        expect(screen.getByRole('button', { name: 'λ0.1' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.2' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.3' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.4' })).toBeDefined()
        expect(screen.getByRole('button', { name: 'λ0.5' })).toBeDefined()

        const defaultButton = screen.getByRole('button', { name: 'λ0.4' })
        expect(defaultButton.className).toContain('bg-blue-500')
    })

    it('allows changing lambda value', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const lambda03 = screen.getByRole('button', { name: 'λ0.3' })
        const lambda04 = screen.getByRole('button', { name: 'λ0.4' })

        expect(lambda04.className).toContain('bg-blue-500')

        fireEvent.click(lambda03)
        expect(lambda03.className).toContain('bg-blue-500')
        expect(lambda04.className).not.toContain('bg-blue-500')
    })

    it('allows changing animation speed', () => {
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const speed1xButton = screen.getByRole('button', { name: '1x' })
        expect(speed1xButton.className).toContain('bg-blue-500')

        const speed2xButton = screen.getByRole('button', { name: '2x' })
        fireEvent.click(speed2xButton)
        expect(speed2xButton.className).toContain('bg-blue-500')
        expect(speed1xButton.className).not.toContain('bg-blue-500')
    })

    it('allows pausing/playing the animation', () => {
        vi.useFakeTimers()
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

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

        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)

        rerender(<Top10BillboardRaceView data={mockData} entityType="tracks" />)

        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })

    it('resets to frame 0 and resumes playing when lambda changes', () => {
        vi.useFakeTimers()
        render(<Top10BillboardRaceView data={mockData} entityType="artists" />)

        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        const lambda05 = screen.getByRole('button', { name: 'λ0.5' })
        fireEvent.click(lambda05)

        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })
})
