import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { YearSidebar } from './YearSidebar'

describe('YearSidebar', () => {
    it('renders an "All time" button and one button per year', () => {
        render(
            <YearSidebar
                value={2024}
                onChange={vi.fn()}
                min={2020}
                max={2024}
            />
        )

        screen.getByRole('button', { name: 'All time' })
        for (const year of [2020, 2021, 2022, 2023, 2024]) {
            screen.getByRole('button', { name: String(year) })
        }
    })

    it('marks the selected year as pressed', () => {
        render(
            <YearSidebar
                value={2022}
                onChange={vi.fn()}
                min={2020}
                max={2024}
            />
        )

        expect(
            screen
                .getByRole('button', { name: '2022' })
                .getAttribute('aria-pressed')
        ).toBe('true')
        expect(
            screen
                .getByRole('button', { name: '2023' })
                .getAttribute('aria-pressed')
        ).toBe('false')
    })

    it('marks "All time" as pressed when value is undefined', () => {
        render(
            <YearSidebar
                value={undefined}
                onChange={vi.fn()}
                min={2020}
                max={2024}
            />
        )

        expect(
            screen
                .getByRole('button', { name: 'All time' })
                .getAttribute('aria-pressed')
        ).toBe('true')
    })

    it('calls onChange with the year when a year button is clicked', () => {
        const onChange = vi.fn()
        render(
            <YearSidebar
                value={2024}
                onChange={onChange}
                min={2020}
                max={2024}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: '2021' }))

        expect(onChange).toHaveBeenCalledWith(2021)
    })

    it('calls onChange with undefined when "All time" is clicked', () => {
        const onChange = vi.fn()
        render(
            <YearSidebar
                value={2024}
                onChange={onChange}
                min={2020}
                max={2024}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'All time' }))

        expect(onChange).toHaveBeenCalledWith(undefined)
    })
})
