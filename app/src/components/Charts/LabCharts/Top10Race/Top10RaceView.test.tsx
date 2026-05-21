import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Top10RaceView } from './Top10RaceView'
import type { Top10RaceQueryResult } from './query'

const mockData: Top10RaceQueryResult[] = [
    {
        stream_date_ts: 1704067200000, // 2024-01-01
        artist: 'Artist A',
        play_count: 10,
    },
    {
        stream_date_ts: 1704067200000,
        artist: 'Artist B',
        play_count: 5,
    },
    {
        stream_date_ts: 1704153600000, // 2024-01-02
        artist: 'Artist A',
        play_count: 12,
    },
    {
        stream_date_ts: 1704153600000,
        artist: 'Artist B',
        play_count: 8,
    },
]

describe('Top10RaceView', () => {
    it('renders and displays the first frame of data', () => {
        render(<Top10RaceView data={mockData} />)

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
        render(<Top10RaceView data={mockData} />)

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
        render(<Top10RaceView data={mockData} />)

        // Initially it should be playing. Let's pause it.
        const pauseButton = screen.getByRole('button', { name: 'Pause' })
        fireEvent.click(pauseButton)
        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()

        // Advance timers to see if it remains on frame 0
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(screen.getByText('10')).toBeDefined() // Still first frame count

        // Play again
        const playButton = screen.getByRole('button', { name: 'Play' })
        fireEvent.click(playButton)
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()

        vi.useRealTimers()
    })

})
