import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HourlyStreams } from './HourlyStreams'
import type { HourlyStreamsQueryResult } from './query'

const fixture: HourlyStreamsQueryResult[] = Array.from(
    { length: 24 },
    (_, h) => ({
        hour: h,
        count_streams: h === 8 ? 42 : h === 14 ? 25 : h === 22 ? 10 : 0,
        ms_played:
            h === 8 ? 5400000 : h === 14 ? 3000000 : h === 22 ? 1200000 : 0,
    })
)

describe('HourlyStreams', () => {
    it('renders ChartCard with correct title', () => {
        render(
            <HourlyStreams
                data={fixture}
                maxHourlyCount={42}
                isLoading={false}
            />
        )
        screen.getByRole('heading', { name: /Around the Clock/ })
    })

    it('renders an svg element when data is provided', () => {
        const { container } = render(
            <HourlyStreams
                data={fixture}
                maxHourlyCount={42}
                isLoading={false}
            />
        )
        expect(container.querySelector('svg')).not.toBeNull()
    })

    it('renders path elements only for hours with activity', () => {
        const { container } = render(
            <HourlyStreams
                data={fixture}
                maxHourlyCount={42}
                isLoading={false}
            />
        )
        const paths = container.querySelectorAll('path')
        expect(paths.length).toBe(3)
    })

    it('uses data max when maxHourlyCount is omitted, not a fixed external value', () => {
        const { container: dynamic } = render(
            <HourlyStreams data={fixture} isLoading={false} />
        )
        const { container: fixed } = render(
            <HourlyStreams
                data={fixture}
                maxHourlyCount={100}
                isLoading={false}
            />
        )
        const dDynamic = dynamic.querySelector('path')!.getAttribute('d')
        const dFixed = fixed.querySelector('path')!.getAttribute('d')
        expect(dDynamic).not.toBe(dFixed)
    })

    it('renders empty state when data is undefined and not loading', () => {
        render(
            <HourlyStreams
                data={undefined}
                maxHourlyCount={0}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders skeleton while loading', () => {
        const { container } = render(
            <HourlyStreams
                data={undefined}
                maxHourlyCount={0}
                isLoading={true}
            />
        )
        expect(container.querySelector('.animate-pulse')).not.toBeNull()
    })

    it('shows peak hour in ChartHero', () => {
        render(<HourlyStreams data={fixture} isLoading={false} />)
        screen.getByText('08h')
        screen.getByText('42 streams')
    })

    it('highlights peak hour wedge with darker teal', () => {
        const { container } = render(
            <HourlyStreams data={fixture} isLoading={false} />
        )
        const paths = container.querySelectorAll('path')
        // paths are sorted by hour (data.map over 0-23).
        // Hour 8 (peak, 42 streams) → first <path> → teal-600
        // Hours 14 and 22 → second/third <path> → teal-400
        expect(paths[0].getAttribute('class')).toContain('fill-teal-600')
        expect(paths[1].getAttribute('class')).toContain('fill-teal-400')
    })

    it('shows key hour labels in the svg', () => {
        const { container } = render(
            <HourlyStreams
                data={fixture}
                maxHourlyCount={42}
                isLoading={false}
            />
        )
        const texts = Array.from(container.querySelectorAll('text')).map(
            (el) => el.textContent
        )
        expect(texts).toContain('00')
        expect(texts).toContain('12')
    })
})
