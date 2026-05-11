import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvolutionOverTime } from './EvolutionOverTime'

describe('EvolutionOverTime Component', () => {
    it('renders empty state when data is empty', () => {
        render(<EvolutionOverTime data={[]} year={2025} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', () => {
        const data = [
            { year: 2020, streams: 100, ms_played: 60 * 60 * 1000 },
            { year: 2021, streams: 150, ms_played: 60 * 60 * 1000 },
            { year: 2022, streams: 200, ms_played: 60 * 60 * 1000 },
        ]
        const currentYear = 2022

        render(<EvolutionOverTime data={data} year={currentYear} />)

        screen.getByRole('heading', { name: /📈Soundtrack Growth/ })
        screen.getByText('Total streams')
        screen.getByText('450')
    })

    it('shows tooltip on bar hover', () => {
        const data = [
            { year: 2020, streams: 100, ms_played: 60 * 60 * 1000 },
            { year: 2021, streams: 150, ms_played: 2 * 60 * 60 * 1000 },
            { year: 2022, streams: 200, ms_played: 3 * 60 * 60 * 1000 },
        ]

        render(<EvolutionOverTime data={data} year={2022} />)

        const barElements = document.querySelectorAll('.flex-1')
        expect(barElements.length).toBe(3)

        fireEvent.mouseEnter(barElements[0])

        expect(screen.getByText('100 streams')).toBeDefined()
        expect(screen.getByText('1h 0m 0s')).toBeDefined()

        fireEvent.mouseLeave(barElements[0].parentElement!)
        expect(screen.queryByText('100 streams')).toBeNull()
    })
})
