import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreaksView } from './StreaksView'
import type { StreaksQueryResult } from './query'

function row(stream_date: string): StreaksQueryResult {
    return { stream_date, played: 1 }
}

const defaultProps = {
    year: 2024 as number | undefined,
    isLatestYear: false,
    isLoading: false,
}

describe('StreaksView', () => {
    it('renders empty state when data is empty array', () => {
        render(<StreaksView {...defaultProps} data={[]} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when data is undefined', () => {
        render(<StreaksView {...defaultProps} data={undefined} />)
        screen.getByText('No data for this year')
    })

    it('renders chart title and question', () => {
        render(<StreaksView {...defaultProps} data={[row('2024-03-15')]} />)
        screen.getByText('Listening Streaks')
        screen.getByText('How consistent is your listening?')
    })

    it('renders best streak InsightCard with count and date range', () => {
        // 3-day streak Mar 1–3
        const data = [row('2024-03-01'), row('2024-03-02'), row('2024-03-03')]
        render(<StreaksView {...defaultProps} data={data} />)
        screen.getByText(/Best streak/)
        screen.getByText(/3 days/)
        // date range should mention Mar
        const bestCard = screen.getByText(/Best streak/).closest('div')
        expect(bestCard?.textContent).toContain('Mar')
    })

    it('does not show current streak when isLatestYear is false', () => {
        render(
            <StreaksView
                {...defaultProps}
                data={[row('2024-03-15')]}
                isLatestYear={false}
            />
        )
        expect(screen.queryByText(/Current streak/)).toBeNull()
    })

    it('shows current streak when isLatestYear is true', () => {
        const data = [row('2024-03-14'), row('2024-03-15')]
        render(
            <StreaksView {...defaultProps} data={data} isLatestYear={true} />
        )
        screen.getByText(/Current streak/)
        screen.getByText(/2 days/)
    })

    it('current streak is 0 when last day of range was a miss', () => {
        // year=2024 → range Jan 1 – Dec 31, last cell Dec 31 not played → streak 0
        const data = [row('2024-03-01'), row('2024-03-02')]
        render(
            <StreaksView
                {...defaultProps}
                data={data}
                year={2024}
                isLatestYear={true}
            />
        )
        screen.getByText(/Current streak/)
        screen.getByText(/0 days/)
    })

    it('renders colored cells for streak days', () => {
        const data = [row('2024-03-01'), row('2024-03-02'), row('2024-03-03')]
        render(<StreaksView {...defaultProps} data={data} />)
        const activeCells = screen.getAllByTestId('streak-cell-active')
        expect(activeCells.length).toBe(3)
    })

    it('renders red cell at streak break', () => {
        // Streak Mar 1–3, then miss Mar 4 (red), Mar 5 new streak start
        const data = [
            row('2024-03-01'),
            row('2024-03-02'),
            row('2024-03-03'),
            row('2024-03-05'),
        ]
        render(<StreaksView {...defaultProps} data={data} />)
        const breakCells = screen.getAllByTestId('streak-cell-break')
        expect(breakCells.length).toBe(1)
    })

    it('shows tooltip with streak day info on green cell hover', () => {
        const data = [row('2024-03-01'), row('2024-03-02')]
        render(<StreaksView {...defaultProps} data={data} />)
        const activeCells = screen.getAllByTestId('streak-cell-active')
        fireEvent.mouseEnter(activeCells[activeCells.length - 1])
        screen.getByText(/Day \d+ of streak/)
    })

    it('shows tooltip with "Streak broken" on red cell hover', () => {
        const data = [row('2024-03-01'), row('2024-03-02'), row('2024-03-04')]
        render(<StreaksView {...defaultProps} data={data} />)
        const breakCells = screen.getAllByTestId('streak-cell-break')
        expect(breakCells.length).toBe(1)
        fireEvent.mouseEnter(breakCells[0])
        screen.getByText('Streak broken')
    })

    it('hides tooltip on mouse leave from scroll container', () => {
        const data = [row('2024-03-01'), row('2024-03-02')]
        const { container } = render(
            <StreaksView {...defaultProps} data={data} />
        )
        const activeCells = screen.getAllByTestId('streak-cell-active')
        fireEvent.mouseEnter(activeCells[0])
        screen.getByText(/Day \d+ of streak/)

        const scrollContainer = container.querySelector('.overflow-x-auto')!
        fireEvent.mouseLeave(scrollContainer)
        expect(screen.queryByText(/Day \d+ of streak/)).toBeNull()
    })

    it('year-scoped range shows no red when missed days are outside firstPlayed..lastPlayed', () => {
        // Only Mar 1–2 data, Mar 3 is after lastPlayed → inRange=false → no red
        const data = [row('2024-03-01'), row('2024-03-02')]
        render(<StreaksView {...defaultProps} data={data} year={2024} />)
        expect(screen.queryAllByTestId('streak-cell-break').length).toBe(0)
    })

    it('year-scoped shows red only at streak break within played range', () => {
        // Mar 1–3 played, Mar 4 missed (between firstPlayed=Mar1 and lastPlayed=Mar5) → red
        const data = [
            row('2024-03-01'),
            row('2024-03-02'),
            row('2024-03-03'),
            row('2024-03-05'),
        ]
        render(<StreaksView {...defaultProps} data={data} year={2024} />)
        const breakCells = screen.getAllByTestId('streak-cell-break')
        expect(breakCells.length).toBe(1)
    })

    it('all-time range: gap between played dates turns red at break', () => {
        // Mar 1–2 played, Mar 3 gap (inRange=true in all-time), Mar 4 played
        const data = [row('2023-03-01'), row('2023-03-02'), row('2023-03-04')]
        render(<StreaksView {...defaultProps} data={data} year={undefined} />)
        // Mar 3 is break → red
        const breakCells = screen.getAllByTestId('streak-cell-break')
        expect(breakCells.length).toBe(1)
    })

    it('single date: best streak = 1 day, start equals end', () => {
        render(<StreaksView {...defaultProps} data={[row('2024-06-15')]} />)
        screen.getByText(/1 days/)
        const bestCard = screen.getByText(/Best streak/).closest('div')
        // start = end = Jun 15 → both dates in text
        expect(bestCard?.textContent?.match(/Jun/g)?.length).toBeGreaterThan(0)
    })
})
