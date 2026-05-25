import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RaceControlBar } from './RaceControlBar'

const startTs = 1704067200000 // 2024-01-01
const endTs = 1735603200000 // 2024-12-31

const defaultProps = {
    frameCount: 10,
    startTs,
    endTs,
    currentFrameIdx: 0,
    speedMultiplier: 1,
    isPlaying: false,
    onFrameChange: vi.fn(),
    onSpeedChange: vi.fn(),
    onPlayPause: vi.fn(),
}

describe('RaceControlBar', () => {
    it('renders start and end date labels', () => {
        render(<RaceControlBar {...defaultProps} />)

        const dates = screen.getAllByText(/2024/)
        expect(dates.length).toBeGreaterThanOrEqual(2)
    })

    it('renders all speed buttons', () => {
        render(<RaceControlBar {...defaultProps} />)

        expect(screen.getByRole('button', { name: '0.5x' })).toBeDefined()
        expect(screen.getByRole('button', { name: '1x' })).toBeDefined()
        expect(screen.getByRole('button', { name: '2x' })).toBeDefined()
        expect(screen.getByRole('button', { name: '4x' })).toBeDefined()
    })

    it('highlights the active speed button', () => {
        render(<RaceControlBar {...defaultProps} speedMultiplier={2} />)

        expect(screen.getByRole('button', { name: '2x' }).className).toContain(
            'bg-blue-500'
        )
        expect(
            screen.getByRole('button', { name: '1x' }).className
        ).not.toContain('bg-blue-500')
    })

    it('shows Play button when not playing and not at end', () => {
        render(
            <RaceControlBar
                {...defaultProps}
                isPlaying={false}
                currentFrameIdx={0}
            />
        )

        expect(screen.getByRole('button', { name: 'Play' })).toBeDefined()
    })

    it('shows Pause button when playing', () => {
        render(<RaceControlBar {...defaultProps} isPlaying={true} />)

        expect(screen.getByRole('button', { name: 'Pause' })).toBeDefined()
    })

    it('shows Replay button when at last frame', () => {
        render(
            <RaceControlBar
                {...defaultProps}
                isPlaying={false}
                currentFrameIdx={9}
            />
        )

        expect(screen.getByRole('button', { name: 'Replay' })).toBeDefined()
    })

    it('calls onSpeedChange with correct value on speed button click', () => {
        const onSpeedChange = vi.fn()
        render(
            <RaceControlBar {...defaultProps} onSpeedChange={onSpeedChange} />
        )

        fireEvent.click(screen.getByRole('button', { name: '4x' }))
        expect(onSpeedChange).toHaveBeenCalledWith(4)
    })

    it('calls onPlayPause on play button click', () => {
        const onPlayPause = vi.fn()
        render(<RaceControlBar {...defaultProps} onPlayPause={onPlayPause} />)

        fireEvent.click(screen.getByRole('button', { name: 'Play' }))
        expect(onPlayPause).toHaveBeenCalledOnce()
    })

    it('calls onFrameChange with slider value', () => {
        const onFrameChange = vi.fn()
        render(
            <RaceControlBar {...defaultProps} onFrameChange={onFrameChange} />
        )

        const slider = screen.getByRole('slider', {
            name: 'Animation timeline',
        })
        fireEvent.change(slider, { target: { value: '5' } })
        expect(onFrameChange).toHaveBeenCalledWith(5)
    })
})
