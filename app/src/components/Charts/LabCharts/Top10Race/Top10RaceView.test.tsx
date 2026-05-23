import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Top10RaceView } from './Top10RaceView'
import type { Top10RaceQueryResult } from './query'

const mockData: Top10RaceQueryResult[] = [
    {
        stream_date_ts: 1704067200000, // 2024-01-01
        entity_name: 'Artist A',
        play_count: 10,
    },
    {
        stream_date_ts: 1704067200000,
        entity_name: 'Artist B',
        play_count: 5,
    },
    {
        stream_date_ts: 1704153600000, // 2024-01-02
        entity_name: 'Artist A',
        play_count: 12,
    },
    {
        stream_date_ts: 1704153600000,
        entity_name: 'Artist B',
        play_count: 8,
    },
]

describe('Top10RaceView', () => {
    afterEach(() => {
        vi.clearAllTimers()
    })

    it('renders and displays the first frame of data', () => {
        render(<Top10RaceView data={mockData} entityType="artists" />)

        // Verify the date is rendered (2024-01-01 or local equivalent formatting)
        expect(screen.getByRole('heading', { level: 4 })).toBeDefined()

        // Verify the artists in the first frame are shown
        expect(screen.getByText('Artist A')).toBeDefined()
        expect(screen.getByText('Artist B')).toBeDefined()

        // Verify play counts are shown
        expect(screen.getByText('10')).toBeDefined()
        expect(screen.getByText('5')).toBeDefined()

        // Verify streams column header and daily granularity label
        expect(screen.getByText('streams')).toBeDefined()
        expect(screen.getByText(/daily/)).toBeDefined()

        // Start/End labels replaced by formatted dates
        expect(screen.queryByText('Start')).toBeNull()
        expect(screen.queryByText('End')).toBeNull()
    })

    it('allows changing animation speed', () => {
        render(<Top10RaceView data={mockData} entityType="artists" />)

        // Initially speed 1x is selected
        const speed1xButton = screen.getByRole('button', { name: '1x' })
        expect(speed1xButton.className).toContain('bg-blue-500')

        // Click on 2x
        const speed2xButton = screen.getByRole('button', { name: '2x' })
        fireEvent.click(speed2xButton)
        expect(speed2xButton.className).toContain('bg-blue-500')
        expect(speed1xButton.className).not.toContain('bg-blue-500')
    })

    it('allows pausing/playing the animation', async () => {
        vi.useFakeTimers()
        render(<Top10RaceView data={mockData} entityType="artists" />)

        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        const playButton = screen.getByRole('button', { name: 'Play' })
        fireEvent.click(playButton)
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(screen.getByText('10')).toBeDefined()

        vi.useRealTimers()
    })

    it('resets to frame 0 and resumes playing when entityType changes', () => {
        vi.useFakeTimers()
        const { rerender } = render(
            <Top10RaceView data={mockData} entityType="artists" />
        )

        act(() => {
            rerender(<Top10RaceView data={mockData} entityType="tracks" />)
        })

        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })
})
