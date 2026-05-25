import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamTimeline } from './StreamTimeline'
import type { StreamTimelineQueryResult } from './query'

const MS_1H = 3_600_000
const MS_2H = 7_200_000

const twoMonths: StreamTimelineQueryResult[] = [
    { ts: '2024-01-01', ms_played: MS_1H, count_streams: 5 },
    { ts: '2024-02-01', ms_played: MS_2H, count_streams: 8 },
]

const defaultProps = {
    granularity: 'month' as const,
    availableGranularities: ['month', 'week', 'day'] as const,
    onGranularityChange: () => {},
    isLoading: false,
}

describe('StreamTimeline', () => {
    it('renders empty state when data is empty', () => {
        render(<StreamTimeline {...defaultProps} data={[]} year={2024} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all streams are zero', () => {
        render(
            <StreamTimeline
                {...defaultProps}
                data={[{ ts: '2024-01-01', ms_played: 0, count_streams: 0 }]}
                year={2024}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders chart heading and summary stats', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        screen.getByRole('heading', { name: /Stream Timeline/ })
        screen.getByText('Total duration')
        screen.getByText('Total streams')
        screen.getByText('13')
    })

    it('highlights max bar with brand-purple', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        const purpleBars = Array.from(bars).filter((b) =>
            b.classList.contains('bg-brand-purple')
        )
        expect(purpleBars).toHaveLength(1)
    })

    it('shows one label per bar in per-year month view', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        const labelRow = document.querySelectorAll(
            '.flex.gap-0\\.5.mb-4 .flex-1'
        )
        expect(labelRow).toHaveLength(twoMonths.length)
    })

    it('shows year boundaries and no month labels in all-time month view', () => {
        const multiYear: StreamTimelineQueryResult[] = [
            { ts: '2023-11-01', ms_played: MS_1H, count_streams: 3 },
            { ts: '2023-12-01', ms_played: MS_1H, count_streams: 4 },
            { ts: '2024-01-01', ms_played: MS_2H, count_streams: 8 },
            { ts: '2024-02-01', ms_played: MS_1H, count_streams: 5 },
        ]
        render(
            <StreamTimeline
                {...defaultProps}
                availableGranularities={['year', 'month']}
                data={multiYear}
                year={undefined}
            />
        )
        expect(screen.queryByText('Jan')).toBeNull()
        screen.getByText('2024')
        expect(screen.queryByText('2023')).toBeNull()
    })

    it('shows tooltip on bar hover and hides on mouse leave', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.getByText('5 streams')).toBeDefined()
        expect(screen.getByText('1h 0m 0s')).toBeDefined()

        fireEvent.mouseLeave(bars[0].closest('.flex.items-end')!)
        expect(screen.queryByText('5 streams')).toBeNull()
    })

    it('does not show tooltip on zero-ms bar hover', () => {
        const dataWithZero: StreamTimelineQueryResult[] = [
            { ts: '2024-01-01', ms_played: 0, count_streams: 0 },
            { ts: '2024-02-01', ms_played: MS_1H, count_streams: 3 },
        ]
        render(
            <StreamTimeline {...defaultProps} data={dataWithZero} year={2024} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.queryByText('0 streams')).toBeNull()
        expect(document.querySelector('.fixed.z-50')).toBeNull()
    })

    it('renders all four granularity buttons regardless of available set', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        screen.getByRole('button', { name: 'Year' })
        screen.getByRole('button', { name: 'Month' })
        screen.getByRole('button', { name: 'Week' })
        screen.getByRole('button', { name: 'Day' })
    })

    it('active button is highlighted, unavailable buttons are disabled', () => {
        render(
            <StreamTimeline {...defaultProps} data={twoMonths} year={2024} />
        )
        const monthBtn = screen.getByRole('button', { name: 'Month' })
        const yearBtn = screen.getByRole('button', { name: 'Year' })
        expect(monthBtn.className).toContain('bg-blue-500')
        expect((yearBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('calls onGranularityChange when tab is clicked', () => {
        const onChange = vi.fn()
        render(
            <StreamTimeline
                {...defaultProps}
                onGranularityChange={onChange}
                data={twoMonths}
                year={2024}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Week' }))
        expect(onChange).toHaveBeenCalledWith('week')
    })
})
