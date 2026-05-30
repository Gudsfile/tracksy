import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ListeningBingoView } from './ListeningBingoView'
import type { ListeningBingoQueryResult } from './query'
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

const sampleData: ListeningBingoQueryResult[] = [
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

// 7 rows: same hour (10) across all 7 days → firstCompleteHour at frame 0
const completeHourData: ListeningBingoQueryResult[] = Array.from(
    { length: 7 },
    (_, d) => ({
        stream_date_ts: 1000,
        day_of_week: d,
        play_hour: 10,
        cumulative_count: 1,
    })
)

// 24 rows: same day (Mon=1) across all 24 hours → firstCompleteDay at frame 0
const completeDayData: ListeningBingoQueryResult[] = Array.from(
    { length: 24 },
    (_, h) => ({
        stream_date_ts: 1000,
        day_of_week: 1,
        play_hour: h,
        cumulative_count: 1,
    })
)

// 168 rows: all cells → bingo at frame 0
const bingoData: ListeningBingoQueryResult[] = Array.from(
    { length: 7 },
    (_, d) =>
        Array.from({ length: 24 }, (_, h) => ({
            stream_date_ts: 1000,
            day_of_week: d,
            play_hour: h,
            cumulative_count: 1,
        }))
).flat()

// hour 10 gets all 7 days spread over 2 dates; milestone at frame 1
const completeHourTwoDatesData: ListeningBingoQueryResult[] = [
    ...Array.from({ length: 6 }, (_, d) => ({
        stream_date_ts: 1000,
        day_of_week: d,
        play_hour: 10,
        cumulative_count: 1,
    })),
    {
        stream_date_ts: 2000,
        day_of_week: 6,
        play_hour: 10,
        cumulative_count: 1,
    },
]

// Two dates: frame 0 reveals (1,10), frame 1 adds (3,14)
const twoDatesData: ListeningBingoQueryResult[] = [
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

// Same logic as the component — locale-aware day names
function localeDayName(dayOfWeek: number) {
    return new Date(Date.UTC(2025, 0, 5 + dayOfWeek)).toLocaleDateString(
        undefined,
        { weekday: 'long', timeZone: 'UTC' }
    )
}

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

describe('ListeningBingoView', () => {
    it('renders chart title', () => {
        render(<ListeningBingoView data={sampleData} year={2024} />)
        screen.getByText(/Listening Bingo/)
    })

    it('renders the question subtitle', () => {
        render(<ListeningBingoView data={sampleData} year={2024} />)
        screen.getByText('Have you listened at every hour of every day?')
    })

    it('renders grid when data is empty', () => {
        const { container } = render(
            <ListeningBingoView data={[]} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    it('renders grid when data is undefined', () => {
        const { container } = render(
            <ListeningBingoView data={undefined} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    it('does not show "cells uncovered" when data is empty', () => {
        render(<ListeningBingoView data={[]} year={2024} />)
        expect(screen.queryByText(/cells uncovered/)).toBeNull()
    })

    it('does not show "cells uncovered" when data is undefined', () => {
        render(<ListeningBingoView data={undefined} year={2024} />)
        expect(screen.queryByText(/cells uncovered/)).toBeNull()
    })

    it('renders sparse day labels', () => {
        render(<ListeningBingoView data={sampleData} year={2024} />)
        const grid = screen.getByTestId('bingo-grid-desktop')
        within(grid).getByText('Mon')
        within(grid).getByText('Wed')
        within(grid).getByText('Fri')
    })

    it('renders sparse hour labels at multiples of 6', () => {
        render(<ListeningBingoView data={sampleData} year={2024} />)
        const grid = screen.getByTestId('bingo-grid-desktop')
        within(grid).getByText('0')
        within(grid).getByText('6')
        within(grid).getByText('12')
        within(grid).getByText('18')
    })

    it('renders 168 cells (7 days x 24 hours)', () => {
        const { container } = render(
            <ListeningBingoView data={sampleData} year={2024} />
        )
        expect(getCells(container)).toHaveLength(168)
    })

    describe('animation controls', () => {
        it('no RaceControlBar when data is empty', () => {
            render(<ListeningBingoView data={[]} year={2024} />)
            expect(
                screen.queryByRole('slider', { name: /timeline/i })
            ).toBeNull()
        })

        it('no RaceControlBar when data spans a single date', () => {
            render(<ListeningBingoView data={sampleData} year={2024} />)
            expect(
                screen.queryByRole('slider', { name: /timeline/i })
            ).toBeNull()
        })

        it('RaceControlBar rendered when data spans multiple dates', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            screen.getByRole('slider', { name: /timeline/i })
        })
    })

    describe('cell state at frame 0', () => {
        it('revealed cells have teal background color', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            // sampleData frame 0: (0,10) and (3,22) revealed
            expect(isRevealed(getCell(container, 0, 10))).toBe(true)
            expect(isRevealed(getCell(container, 3, 22))).toBe(true)
        })

        it('unrevealed cells have no background color', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            expect(isRevealed(getCell(container, 0, 0))).toBe(false)
            expect(isRevealed(getCell(container, 6, 23))).toBe(false)
        })

        it('at frame 0 of two-date data: only first-date cell revealed', () => {
            const { container } = render(
                <ListeningBingoView data={twoDatesData} year={2024} />
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
                <ListeningBingoView data={twoDatesData} year={2024} />
            )
            expect(isRevealed(getCell(container, 1, 10))).toBe(true)
            expect(isRevealed(getCell(container, 3, 14))).toBe(true)
        })

        it('previously revealed cell remains revealed at frame 1', () => {
            const { container } = render(
                <ListeningBingoView data={twoDatesData} year={2024} />
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
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const grid = screen.getByTestId('bingo-grid-desktop')
            within(grid).getByText('TOTAL')
        })

        it('renders TOT row label', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const grid = screen.getByTestId('bingo-grid-desktop')
            within(grid).getByText('TOT')
        })

        it('shows correct day total at frame 0', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-1')
            expect(el.textContent).toBe('3')
        })

        it('shows empty day total for day with no streams at frame 0', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-3')
            expect(el.textContent).toBe('')
        })

        it('shows correct hour total at frame 0', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('hour-total-10')
            expect(el.textContent).toBe('3')
        })

        it('top day cell has accent class at frame 0', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-1')
            expect(el.className).toContain('text-teal-500')
        })

        it('non-top day cells do not have accent class', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('day-total-3')
            expect(el.className).not.toContain('text-teal-500')
        })

        it('top hour cell has accent class', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
            const el = screen.getByTestId('hour-total-10')
            expect(el.className).toContain('text-teal-500')
        })

        it('non-top hour cells do not have accent class', () => {
            render(<ListeningBingoView data={twoDatesData} year={2024} />)
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
                render(<ListeningBingoView data={twoDatesData} year={2024} />)
                expect(screen.getByTestId('day-total-1').textContent).toBe('5')
                expect(screen.getByTestId('day-total-3').textContent).toBe('2')
            })

            it('hour totals update at frame 1', () => {
                render(<ListeningBingoView data={twoDatesData} year={2024} />)
                expect(screen.getByTestId('hour-total-10').textContent).toBe(
                    '5'
                )
                expect(screen.getByTestId('hour-total-14').textContent).toBe(
                    '2'
                )
            })

            it('top day accent persists regardless of frame', () => {
                render(<ListeningBingoView data={twoDatesData} year={2024} />)
                expect(screen.getByTestId('day-total-1').className).toContain(
                    'text-teal-500'
                )
            })

            it('top hour accent persists regardless of frame', () => {
                render(<ListeningBingoView data={twoDatesData} year={2024} />)
                expect(screen.getByTestId('hour-total-10').className).toContain(
                    'text-teal-500'
                )
            })
        })
    })

    describe('achievements panel', () => {
        it('renders all three achievement labels', () => {
            render(<ListeningBingoView data={sampleData} year={2024} />)
            screen.getByText('First complete hour')
            screen.getByText('First complete day')
            screen.getByText('Bingo')
        })

        it('shows "N cells uncovered" for bingo when fewer than 168 cells', () => {
            render(<ListeningBingoView data={sampleData} year={2024} />)
            screen.getByText('166 cells uncovered')
        })

        it('hides first complete hour value at frame 0 when not yet reached', () => {
            render(<ListeningBingoView data={sampleData} year={2024} />)
            // sampleData has only 2 cells; no hour has all 7 days covered
            expect(screen.queryByText(/h · /)).toBeNull()
        })

        it('shows first complete hour value when milestone frame reached', () => {
            render(<ListeningBingoView data={completeHourData} year={2024} />)
            // milestone at frame 0, currentFrameIdx=0 → value should be visible
            expect(screen.getByText(/10h/)).toBeTruthy()
        })

        it('hides first complete hour value before milestone frame', () => {
            // completeHourTwoDatesData: milestone at frame 1; mock at frame 0
            render(
                <ListeningBingoView
                    data={completeHourTwoDatesData}
                    year={2024}
                />
            )
            expect(screen.queryByText(/10h/)).toBeNull()
        })

        it('shows first complete hour value at milestone frame', () => {
            vi.spyOn(useRacePlaybackModule, 'useRacePlayback').mockReturnValue(
                makePlaybackMock(1)
            )
            render(
                <ListeningBingoView
                    data={completeHourTwoDatesData}
                    year={2024}
                />
            )
            expect(screen.getByText(/10h/)).toBeTruthy()
        })

        it('shows bingo date when all 168 cells reached at frame 0', () => {
            render(<ListeningBingoView data={bingoData} year={2024} />)
            expect(screen.queryByText(/cells uncovered/)).toBeNull()
            // bingo date should be rendered (toLocaleDateString of ts=1000)
            const bingoDate = new Date(1000).toLocaleDateString()
            expect(screen.getByText(bingoDate)).toBeTruthy()
        })

        it('shows "N cells uncovered" when bingo is never reached', () => {
            // completeHourData has only 7 cells → 161 uncovered
            render(<ListeningBingoView data={completeHourData} year={2024} />)
            screen.getByText('161 cells uncovered')
        })

        it('hides "N cells uncovered" before the final frame', () => {
            // completeHourTwoDatesData spans 2 frames; bingo never reached
            // at frame 0 (not final), "N cells uncovered" should not appear
            render(
                <ListeningBingoView
                    data={completeHourTwoDatesData}
                    year={2024}
                />
            )
            expect(screen.queryByText(/cells uncovered/)).toBeNull()
        })

        it('shows "N cells uncovered" at the final frame when bingo never reached', () => {
            vi.spyOn(useRacePlaybackModule, 'useRacePlayback').mockReturnValue(
                makePlaybackMock(1)
            )
            render(
                <ListeningBingoView
                    data={completeHourTwoDatesData}
                    year={2024}
                />
            )
            screen.getByText(/cells uncovered/)
        })

        it('hides first complete day value before milestone frame', () => {
            // sampleData has no complete day
            render(<ListeningBingoView data={sampleData} year={2024} />)
            const allDayNames = Array.from({ length: 7 }, (_, i) =>
                localeDayName(i)
            ).join('|')
            expect(screen.queryByText(new RegExp(allDayNames))).toBeNull()
        })

        it('shows first complete day value when milestone frame reached', () => {
            render(<ListeningBingoView data={completeDayData} year={2024} />)
            // completeDayData uses day_of_week=1 (Monday-equivalent in locale)
            expect(screen.getByText(new RegExp(localeDayName(1)))).toBeTruthy()
        })
    })

    describe('tooltip', () => {
        it('no tooltip initially', () => {
            render(<ListeningBingoView data={sampleData} year={2024} />)
            expect(document.body.textContent).not.toContain('streams')
        })

        it('tooltip appears on mouseenter of revealed cell', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            const cell = getCell(container, 0, 10)
            expect(isRevealed(cell)).toBe(true)
            fireEvent.mouseEnter(cell)
            expect(document.body.textContent).toContain('streams')
            expect(document.body.textContent).toContain('first played')
        })

        it('tooltip shows day name and hour', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            // sampleData: (0,10) = day 0 (Sunday-equivalent in locale), hour 10
            fireEvent.mouseEnter(getCell(container, 0, 10))
            expect(document.body.textContent).toContain(localeDayName(0))
            expect(document.body.textContent).toContain('10h')
        })

        it('unrevealed cell shows tooltip with 0 streams', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            const cell = getCell(container, 0, 0)
            expect(isRevealed(cell)).toBe(false)
            fireEvent.mouseEnter(cell)
            expect(document.body.textContent).toContain('0 streams')
        })

        it('unrevealed cell tooltip has no first played line', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            fireEvent.mouseEnter(getCell(container, 0, 0))
            expect(document.body.textContent).not.toContain('first played')
        })

        it('tooltip disappears on mouseleave of grid', () => {
            const { container } = render(
                <ListeningBingoView data={sampleData} year={2024} />
            )
            fireEvent.mouseEnter(getCell(container, 0, 10))
            expect(document.body.textContent).toContain('streams')
            const grid = screen.getByTestId('bingo-grid-desktop')
            fireEvent.mouseLeave(grid)
            expect(document.body.textContent).not.toContain('streams')
        })
    })
})
