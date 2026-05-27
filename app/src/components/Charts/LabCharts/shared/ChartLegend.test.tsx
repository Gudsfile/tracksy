import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChartLegend } from './ChartLegend'

describe('ChartLegend', () => {
    it('renders all items', () => {
        const { getByText } = render(
            <ChartLegend
                items={[
                    { color: 'bg-rose-800', label: 'New' },
                    { color: 'bg-rose-500', label: 'Known' },
                ]}
            />
        )
        expect(getByText('New')).toBeTruthy()
        expect(getByText('Known')).toBeTruthy()
    })

    it('applies color class to swatch', () => {
        const { container } = render(
            <ChartLegend
                items={[{ color: 'bg-orange-400', label: 'Distinct' }]}
            />
        )
        expect(container.querySelector('.bg-orange-400')).toBeTruthy()
    })

    it('renders empty without items', () => {
        const { container } = render(<ChartLegend items={[]} />)
        expect(container.querySelectorAll('span').length).toBe(0)
    })
})
