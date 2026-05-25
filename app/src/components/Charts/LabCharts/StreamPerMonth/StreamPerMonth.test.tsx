import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreamPerMonth } from './StreamPerMonth'
import type { StreamPerMonthQueryResult } from './query'

const MS_1H = 3_600_000
const MS_2H = 7_200_000

const twoMonths: StreamPerMonthQueryResult[] = [
    { ts: '2024-01-01', ms_played: MS_1H, count_streams: 5 },
    { ts: '2024-02-01', ms_played: MS_2H, count_streams: 8 },
]

describe('StreamPerMonth', () => {
    it('renders empty state when data is empty', () => {
        render(<StreamPerMonth data={[]} year={2024} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all streams are zero', () => {
        render(
            <StreamPerMonth
                data={[{ ts: '2024-01-01', ms_played: 0, count_streams: 0 }]}
                year={2024}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders chart heading and summary stats', () => {
        render(
            <StreamPerMonth data={twoMonths} year={2024} isLoading={false} />
        )
        screen.getByRole('heading', { name: /Monthly Listening/ })
        screen.getByText('Total duration')
        screen.getByText('Total streams')
        screen.getByText('13')
    })

    it('highlights max bar with brand-purple', () => {
        render(
            <StreamPerMonth data={twoMonths} year={2024} isLoading={false} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        const purpleBars = Array.from(bars).filter((b) =>
            b.classList.contains('bg-brand-purple')
        )
        expect(purpleBars).toHaveLength(1)
    })

    it('shows one label per bar in per-year view', () => {
        render(
            <StreamPerMonth data={twoMonths} year={2024} isLoading={false} />
        )
        const labelRow = document.querySelectorAll(
            '.flex.gap-0\\.5.mb-4 .flex-1'
        )
        expect(labelRow).toHaveLength(twoMonths.length)
    })

    it('shows year boundaries and no month labels in all-time view', () => {
        const multiYear: StreamPerMonthQueryResult[] = [
            { ts: '2023-11-01', ms_played: MS_1H, count_streams: 3 },
            { ts: '2023-12-01', ms_played: MS_1H, count_streams: 4 },
            { ts: '2024-01-01', ms_played: MS_2H, count_streams: 8 },
            { ts: '2024-02-01', ms_played: MS_1H, count_streams: 5 },
        ]
        render(
            <StreamPerMonth
                data={multiYear}
                year={undefined}
                isLoading={false}
            />
        )
        expect(screen.queryByText('Jan')).toBeNull()
        screen.getByText('2024')
        expect(screen.queryByText('2023')).toBeNull()
    })

    it('shows tooltip on bar hover and hides on mouse leave', () => {
        render(
            <StreamPerMonth data={twoMonths} year={2024} isLoading={false} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.getByText('5 streams')).toBeDefined()
        expect(screen.getByText('1h 0m 0s')).toBeDefined()

        fireEvent.mouseLeave(bars[0].closest('.flex.items-end')!)
        expect(screen.queryByText('5 streams')).toBeNull()
    })

    it('does not show tooltip on zero-ms bar hover', () => {
        const dataWithZero: StreamPerMonthQueryResult[] = [
            { ts: '2024-01-01', ms_played: 0, count_streams: 0 },
            { ts: '2024-02-01', ms_played: MS_1H, count_streams: 3 },
        ]
        render(
            <StreamPerMonth data={dataWithZero} year={2024} isLoading={false} />
        )
        const bars = document.querySelectorAll('.flex-1.rounded-t')
        fireEvent.mouseEnter(bars[0])
        expect(screen.queryByText('0 streams')).toBeNull()
        expect(document.querySelector('.fixed.z-50')).toBeNull()
    })
})
