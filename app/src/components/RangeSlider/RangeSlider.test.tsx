import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RangeSlider } from './RangeSlider'

describe('RangeSlider', () => {
    it('renders with a value', () => {
        const onChange = vi.fn()
        render(
            <RangeSlider
                value={2022}
                onChange={onChange}
                min={2020}
                max={2024}
                step={1}
            />
        )

        expect(screen.getByText('2022')).toBeTruthy()
    })

    it('renders with undefined value using the nullish fallback', () => {
        const onChange = vi.fn()
        render(
            <RangeSlider
                value={undefined}
                onChange={onChange}
                min={2020}
                max={2024}
                step={1}
            />
        )

        expect(screen.getAllByText('All')).toHaveLength(2)
    })

    it('calls onChange with undefined when slider is at min', () => {
        const onChange = vi.fn()
        render(
            <RangeSlider
                value={2022}
                onChange={onChange}
                min={2020}
                max={2024}
                step={1}
            />
        )

        const slider = screen.getByRole('slider')
        fireEvent.change(slider, { target: { value: '2019' } })

        expect(onChange).toHaveBeenCalledWith(undefined)
    })

    it('calls onChange with the value when slider changes', () => {
        const onChange = vi.fn()
        render(
            <RangeSlider
                value={2022}
                onChange={onChange}
                min={2020}
                max={2024}
                step={1}
            />
        )

        const slider = screen.getByRole('slider')
        fireEvent.change(slider, { target: { value: '2023' } })

        expect(onChange).toHaveBeenCalledWith(2023)
    })
})
