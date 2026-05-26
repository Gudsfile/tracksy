import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreamPerDayOfWeekView } from './StreamPerDayOfWeekView'
import type { StreamPerDayOfWeekQueryResult } from './query'
import * as useRacePlaybackModule from '../Common/useRacePlayback'

const makePlaybackMock = (currentFrameIdx = 0) => ({
    containerRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    currentFrameIdx,
    isPlaying: false,
    speedMultiplier: 1,
    onFrameChange: vi.fn(),
    onSpeedChange: vi.fn(),
    onPlayPause: vi.fn(),
})

beforeEach(() => {
    vi.spyOn(useRacePlaybackModule, 'useRacePlayback').mockReturnValue(
        makePlaybackMock(0)
    )
})

afterEach(() => {
    vi.restoreAllMocks()
})

const sampleData: StreamPerDayOfWeekQueryResult[] = [
    {
        stream_date_ts: 1000,
        day_of_week: 0,
        play_hour: 10,
        cumulative_count: 1,
    },
    {
        stream_date_ts: 1000,
        day_of_week: 3,
        play_hour: 22,
        cumulative_count: 3,
    },
]

// Two dates: frame 0 reveals (1,10), frame 1 adds (3,14)
const twoDatesData: StreamPerDayOfWeekQueryResult[] = [
    {
        stream_date_ts: 1000,
        day_of_week: 1,
        play_hour: 10,
        cumulative_count: 3,
    },
    {
        stream_date_ts: 2000,
        day_of_week: 1,
        play_hour: 10,
        cumulative_count: 5,
    },
    {
        stream_date_ts: 2000,
        day_of_week: 3,
        play_hour: 14,
        cumulative_count: 2,
    },
]

function getCells(container: HTMLElement) {
    return Array.from(
        container.querySelectorAll<HTMLElement>('[style*="aspect-ratio"]')
    )
}

// Cell (d, h) is at index d*24 + h in the flat cells array
function getCell(container: HTMLElement, d: number, h: number) {
    return getCells(container)[d * 24 + h]
}

function isRevealed(cell: HTMLElement) {
    return cell.style.backgroundColor !== ''
}

describe('StreamPerDayOfWeekView', () => {
    it('renders chart title', () => {
        render(<StreamPerDayOfWeekView data={sampleData} year={2024} />)
        screen.getByText(/Listening Bingo/)
    })

    it('renders the question subtitle', () => {
        render(<StreamPerDayOfWeekView data={sampleData} year={2024} />)
        screen.getByText('Have you listened at every hour of every day?')
    })

    it('renders grid when data is empty', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={[]} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    it('renders grid when data is undefined', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={undefined} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    it('renders sparse day labels', () => {
        render(<StreamPerDayOfWeekView data={sampleData} year={2024} />)
        screen.getByText('Mon')
        screen.getByText('Wed')
        screen.getByText('Fri')
    })

    it('renders sparse hour labels at multiples of 6', () => {
        render(<StreamPerDayOfWeekView data={sampleData} year={2024} />)
        screen.getByText('0')
        screen.getByText('6')
        screen.getByText('12')
        screen.getByText('18')
    })

    it('renders 168 cells (7 days x 24 hours)', () => {
        const { container } = render(
            <StreamPerDayOfWeekView data={sampleData} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    describe('animation controls', () => {
        it('no RaceControlBar when data is empty', () => {
            render(<StreamPerDayOfWeekView data={[]} year={2024} />)
            expect(
                screen.queryByRole('slider', { name: /timeline/i })
            ).toBeNull()
        })

        it('no RaceControlBar when data spans a single date', () => {
            render(<StreamPerDayOfWeekView data={sampleData} year={2024} />)
            expect(
                screen.queryByRole('slider', { name: /timeline/i })
            ).toBeNull()
        })

        it('RaceControlBar rendered when data spans multiple dates', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            screen.getByRole('slider', { name: /timeline/i })
        })
    })

    describe('cell state at frame 0', () => {
        it('revealed cells have teal background color', () => {
            const { container } = render(
                <StreamPerDayOfWeekView data={sampleData} year={2024} />
            )
            // sampleData frame 0: (0,10) and (3,22) revealed
            expect(isRevealed(getCell(container, 0, 10))).toBe(true)
            expect(isRevealed(getCell(container, 3, 22))).toBe(true)
        })

        it('unrevealed cells have no background color', () => {
            const { container } = render(
                <StreamPerDayOfWeekView data={sampleData} year={2024} />
            )
            expect(isRevealed(getCell(container, 0, 0))).toBe(false)
            expect(isRevealed(getCell(container, 6, 23))).toBe(false)
        })

        it('at frame 0 of two-date data: only first-date cell revealed', () => {
            const { container } = render(
                <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
            )
            // frame 0 has (1,10), NOT (3,14)
            expect(isRevealed(getCell(container, 1, 10))).toBe(true)
            expect(isRevealed(getCell(container, 3, 14))).toBe(false)
        })
    })

    describe('cell state at frame 1', () => {
        beforeEach(() => {
            vi.spyOn(useRacePlaybackModule, 'useRacePlayback').mockReturnValue(
                makePlaybackMock(1)
            )
        })

        it('at frame 1 of two-date data: both cells revealed', () => {
            const { container } = render(
                <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
            )
            expect(isRevealed(getCell(container, 1, 10))).toBe(true)
            expect(isRevealed(getCell(container, 3, 14))).toBe(true)
        })

        it('previously revealed cell remains revealed at frame 1', () => {
            const { container } = render(
                <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
            )
            expect(isRevealed(getCell(container, 1, 10))).toBe(true)
        })
    })

    // twoDatesData frame layout:
    //   frame 0 (ts=1000): (day1, hr10) = 3
    //   frame 1 (ts=2000): (day1, hr10) = 5, (day3, hr14) = 2
    //   final frame: day1=5, day3=2 -> topDay=1 | hr10=5, hr14=2 -> topHour=10
    describe('marginal totals', () => {
        it('renders TOTAL header label', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            screen.getByText('TOTAL')
        })

        it('renders TOT row label', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            screen.getByText('TOT')
        })

        it('shows correct day total at frame 0', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-1')
            expect(el.textContent).toBe('3')
        })

        it('shows empty day total for day with no streams at frame 0', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-3')
            expect(el.textContent).toBe('')
        })

        it('shows correct hour total at frame 0', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('hour-total-10')
            expect(el.textContent).toBe('3')
        })

        it('top day cell has accent class at frame 0', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-1')
            expect(el.className).toContain('text-teal-500')
        })

        it('non-top day cells do not have accent class', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-3')
            expect(el.className).not.toContain('text-teal-500')
        })

        it('top hour cell has accent class', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('hour-total-10')
            expect(el.className).toContain('text-teal-500')
        })

        it('non-top hour cells do not have accent class', () => {
            render(<StreamPerDayOfWeekView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('hour-total-14')
            expect(el.className).not.toContain('text-teal-500')
        })

        describe('at frame 1', () => {
            beforeEach(() => {
                vi.spyOn(
                    useRacePlaybackModule,
                    'useRacePlayback'
                ).mockReturnValue(makePlaybackMock(1))
            })

            it('day totals update at frame 1', () => {
                render(
                    <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
                )
                expect(screen.getByTestId('day-total-1').textContent).toBe('5')
                expect(screen.getByTestId('day-total-3').textContent).toBe('2')
            })

            it('hour totals update at frame 1', () => {
                render(
                    <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
                )
                expect(screen.getByTestId('hour-total-10').textContent).toBe(
                    '5'
                )
                expect(screen.getByTestId('hour-total-14').textContent).toBe(
                    '2'
                )
            })

            it('top day accent persists regardless of frame', () => {
                render(
                    <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
                )
                expect(screen.getByTestId('day-total-1').className).toContain(
                    'text-teal-500'
                )
            })

            it('top hour accent persists regardless of frame', () => {
                render(
                    <StreamPerDayOfWeekView data={twoDatesData} year={2024} />
                )
                expect(screen.getByTestId('hour-total-10').className).toContain(
                    'text-teal-500'
                )
            })
        })
    })
})
