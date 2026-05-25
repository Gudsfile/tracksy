import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamVariety } from './StreamVariety'
import type {
    StreamVarietyQueryResult,
    StreamVarietyStatsQueryResult,
} from './query'

const twoMonths: StreamVarietyQueryResult[] = [
    { ts: '2006-01-01', distinct_count: 2, repeat_count: 1, total_count: 3 },
    { ts: '2006-04-01', distinct_count: 1, repeat_count: 0, total_count: 1 },
]

const defaultStats: StreamVarietyStatsQueryResult = {
    total_distinct: 3,
    total_repeat: 1,
    total_streams: 4,
}

const defaultProps = {
    year: 2006 as number | undefined,
    granularity: 'month' as const,
    availableGranularities: ['month', 'week', 'day'] as const,
    onGranularityChange: () => {},
    entity: 'tracks' as const,
    onEntityChange: () => {},
    stats: defaultStats,
    isLoading: false,
}

describe('StreamVariety', () => {
    it('renders empty state when data is empty', () => {
        render(<StreamVariety {...defaultProps} data={[]} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all totals are zero', () => {
        render(
            <StreamVariety
                {...defaultProps}
                data={[
                    {
                        ts: '2006-01-01',
                        distinct_count: 0,
                        repeat_count: 0,
                        total_count: 0,
                    },
                ]}
                stats={{ total_distinct: 0, total_repeat: 0, total_streams: 0 }}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders chart heading and summary stats', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        screen.getByRole('heading', { name: /Stream Variety/ })
        screen.getByText('Unique tracks listened')
        screen.getByText('Variety rate')
        screen.getByText('3')
        screen.getByText('75%')
    })

    it('renders stacked bars with distinct and re-listen segments', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        const yellowSegments = document.querySelectorAll('.bg-yellow-400')
        const orangeSegments = document.querySelectorAll('.bg-orange-400')
        expect(yellowSegments.length).toBeGreaterThan(0)
        expect(orangeSegments.length).toBeGreaterThan(0)
    })

    it('renders legend for Distinct and Re-listens', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        screen.getByText('Distinct')
        screen.getByText('Re-listens')
    })

    it('renders all three entity buttons', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        screen.getByRole('button', { name: 'Tracks' })
        screen.getByRole('button', { name: 'Artists' })
        screen.getByRole('button', { name: 'Albums' })
    })

    it('active entity button is highlighted', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        const tracksBtn = screen.getByRole('button', { name: 'Tracks' })
        expect(tracksBtn.className).toContain('bg-blue-500')
    })

    it('calls onEntityChange when entity tab is clicked', () => {
        const onEntityChange = vi.fn()
        render(
            <StreamVariety
                {...defaultProps}
                onEntityChange={onEntityChange}
                data={twoMonths}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Artists' }))
        expect(onEntityChange).toHaveBeenCalledWith('artists')
    })

    it('renders all four granularity buttons', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        screen.getByRole('button', { name: 'Year' })
        screen.getByRole('button', { name: 'Month' })
        screen.getByRole('button', { name: 'Week' })
        screen.getByRole('button', { name: 'Day' })
    })

    it('active granularity button is highlighted, unavailable buttons are disabled', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        const monthBtn = screen.getByRole('button', { name: 'Month' })
        const yearBtn = screen.getByRole('button', { name: 'Year' })
        expect(monthBtn.className).toContain('bg-blue-500')
        expect((yearBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('calls onGranularityChange when granularity tab is clicked', () => {
        const onGranularityChange = vi.fn()
        render(
            <StreamVariety
                {...defaultProps}
                onGranularityChange={onGranularityChange}
                data={twoMonths}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Week' }))
        expect(onGranularityChange).toHaveBeenCalledWith('week')
    })

    it('shows tooltip on bar hover and hides on mouse leave', () => {
        render(<StreamVariety {...defaultProps} data={twoMonths} />)
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.getByText('2 distinct')).toBeDefined()
        expect(screen.getByText('1 re-listens')).toBeDefined()

        fireEvent.mouseLeave(bars[0].closest('.flex.items-end')!)
        expect(screen.queryByText('2 distinct')).toBeNull()
    })

    it('does not show tooltip on zero-count bar hover', () => {
        const dataWithZero: StreamVarietyQueryResult[] = [
            {
                ts: '2006-02-01',
                distinct_count: 0,
                repeat_count: 0,
                total_count: 0,
            },
            {
                ts: '2006-03-01',
                distinct_count: 1,
                repeat_count: 0,
                total_count: 1,
            },
        ]
        render(<StreamVariety {...defaultProps} data={dataWithZero} />)
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(document.querySelector('.fixed.z-50')).toBeNull()
    })

    it('hides name collision warning when entity is tracks', () => {
        render(
            <StreamVariety {...defaultProps} entity="tracks" data={twoMonths} />
        )
        expect(
            screen.queryByText(/Artist and album counts rely on names/)
        ).toBeNull()
    })

    it('shows name collision warning when entity is artists', () => {
        render(
            <StreamVariety
                {...defaultProps}
                entity="artists"
                data={twoMonths}
            />
        )
        screen.getByText(/Artist and album counts rely on names/)
    })

    it('shows name collision warning when entity is albums', () => {
        render(
            <StreamVariety {...defaultProps} entity="albums" data={twoMonths} />
        )
        screen.getByText(/Artist and album counts rely on names/)
    })
})
