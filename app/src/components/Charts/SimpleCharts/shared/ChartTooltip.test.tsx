import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChartTooltip } from './ChartTooltip'

describe('ChartTooltip', () => {
    it('renders title', () => {
        render(<ChartTooltip x={100} y={200} title="June 2024" rows={[]} />)
        expect(screen.getByText('June 2024')).toBeDefined()
    })

    it('renders each non-null row', () => {
        render(
            <ChartTooltip
                x={100}
                y={200}
                title="June 2024"
                rows={['42 streams', '1h 30m']}
            />
        )
        expect(screen.getByText('42 streams')).toBeDefined()
        expect(screen.getByText('1h 30m')).toBeDefined()
    })

    it('skips null rows', () => {
        const { baseElement } = render(
            <ChartTooltip
                x={100}
                y={200}
                title="June 2024"
                rows={['42 streams', null, '1h 30m']}
            />
        )
        const rows = baseElement.querySelectorAll('.text-gray-300')
        expect(rows).toHaveLength(2)
    })

    it('renders no rows when array is empty', () => {
        const { baseElement } = render(
            <ChartTooltip x={100} y={200} title="June 2024" rows={[]} />
        )
        const rows = baseElement.querySelectorAll('.text-gray-300')
        expect(rows).toHaveLength(0)
    })

    it('renders secondaryRows separated from rows', () => {
        const { baseElement } = render(
            <ChartTooltip
                x={100}
                y={200}
                title="2024"
                rows={['10 streams', '30m']}
                secondaryRows={['100 total streams', '5h total']}
            />
        )
        expect(baseElement.querySelector('hr')).not.toBeNull()
        const rows = baseElement.querySelectorAll('.text-gray-300')
        expect(rows).toHaveLength(4)
    })

    it('renders no separator when secondaryRows is absent', () => {
        const { baseElement } = render(
            <ChartTooltip x={100} y={200} title="2024" rows={['10 streams']} />
        )
        expect(baseElement.querySelector('hr')).toBeNull()
    })

    it('applies correct position styles', () => {
        const { baseElement } = render(
            <ChartTooltip x={150} y={300} title="Test" rows={[]} />
        )
        const tooltip = baseElement.querySelector('[style*="left: 150px"]')
        expect(tooltip).not.toBeNull()
    })

    it('renders via portal — content is accessible in the document', () => {
        render(<ChartTooltip x={0} y={0} title="Portal content" rows={[]} />)
        expect(document.body.textContent).toContain('Portal content')
    })
})
