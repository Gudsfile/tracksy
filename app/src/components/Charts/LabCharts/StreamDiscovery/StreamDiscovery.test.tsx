import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamDiscovery } from './StreamDiscovery'
import type {
    StreamDiscoveryQueryResult,
    StreamDiscoveryStatsQueryResult,
} from './query'

const twoMonths: StreamDiscoveryQueryResult[] = [
    { ts: '2006-01-01', new_count: 1, known_count: 1, total_count: 2 },
    { ts: '2006-04-01', new_count: 1, known_count: 0, total_count: 1 },
]

const defaultStats: StreamDiscoveryStatsQueryResult = {
    total_new: 2,
    total_known: 1,
    total_distinct: 3,
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

describe('StreamDiscovery', () => {
    it('renders empty state when data is empty', () => {
        render(<StreamDiscovery {...defaultProps} data={[]} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all totals are zero', () => {
        render(
            <StreamDiscovery
                {...defaultProps}
                data={[
                    {
                        ts: '2006-01-01',
                        new_count: 0,
                        known_count: 0,
                        total_count: 0,
                    },
                ]}
                stats={{ total_new: 0, total_known: 0, total_distinct: 0 }}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders chart heading and summary stats', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        screen.getByRole('heading', { name: /Stream Discovery/ })
        screen.getByText('New tracks discovered')
        screen.getByText('Discovery rate')
        screen.getByText('2')
        screen.getByText('67%')
    })

    it('renders stacked bars with new (rose-500) and known (rose-800) segments', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        const newSegments = document.querySelectorAll('.bg-rose-500')
        const knownSegments = document.querySelectorAll('.bg-rose-800')
        expect(newSegments.length).toBeGreaterThan(0)
        expect(knownSegments.length).toBeGreaterThan(0)
    })

    it('new segment has flex 0 when new_count is 0', () => {
        render(
            <StreamDiscovery
                {...defaultProps}
                data={[
                    {
                        ts: '2006-01-01',
                        new_count: 0,
                        known_count: 3,
                        total_count: 3,
                    },
                ]}
            />
        )
        const newSegment = document.querySelector('.bg-rose-500') as HTMLElement
        expect(newSegment.style.flexGrow).toBe('0')
    })

    it('renders legend for New and Known', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        screen.getByText('New')
        screen.getByText('Known')
    })

    it('renders all three entity buttons', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        screen.getByRole('button', { name: 'Tracks' })
        screen.getByRole('button', { name: 'Artists' })
        screen.getByRole('button', { name: 'Albums' })
    })

    it('active entity button is highlighted', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        expect(
            screen.getByRole('button', { name: 'Tracks' }).className
        ).toContain('bg-blue-500')
    })

    it('calls onEntityChange when entity tab is clicked', () => {
        const onEntityChange = vi.fn()
        render(
            <StreamDiscovery
                {...defaultProps}
                onEntityChange={onEntityChange}
                data={twoMonths}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Artists' }))
        expect(onEntityChange).toHaveBeenCalledWith('artists')
    })

    it('renders all four granularity buttons', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        screen.getByRole('button', { name: 'Year' })
        screen.getByRole('button', { name: 'Month' })
        screen.getByRole('button', { name: 'Week' })
        screen.getByRole('button', { name: 'Day' })
    })

    it('active granularity button is highlighted, unavailable buttons are disabled', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        const monthBtn = screen.getByRole('button', { name: 'Month' })
        const yearBtn = screen.getByRole('button', { name: 'Year' })
        expect(monthBtn.className).toContain('bg-blue-500')
        expect((yearBtn as HTMLButtonElement).disabled).toBe(true)
    })

    it('calls onGranularityChange when granularity tab is clicked', () => {
        const onGranularityChange = vi.fn()
        render(
            <StreamDiscovery
                {...defaultProps}
                onGranularityChange={onGranularityChange}
                data={twoMonths}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Week' }))
        expect(onGranularityChange).toHaveBeenCalledWith('week')
    })

    it('shows tooltip on bar hover and hides on mouse leave', () => {
        render(<StreamDiscovery {...defaultProps} data={twoMonths} />)
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.getByText('1 new')).toBeDefined()
        expect(screen.getByText('1 known')).toBeDefined()

        fireEvent.mouseLeave(bars[0].closest('.flex.items-end')!)
        expect(screen.queryByText('1 new')).toBeNull()
    })

    it('does not show tooltip on zero-count bar hover', () => {
        const dataWithZero: StreamDiscoveryQueryResult[] = [
            { ts: '2006-02-01', new_count: 0, known_count: 0, total_count: 0 },
            { ts: '2006-03-01', new_count: 1, known_count: 0, total_count: 1 },
        ]
        render(<StreamDiscovery {...defaultProps} data={dataWithZero} />)
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(document.querySelector('.fixed.z-50')).toBeNull()
    })
})
