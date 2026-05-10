import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChartTooltip } from './ChartTooltip'

describe('ChartTooltip', () => {
    it('renders children at specified position', () => {
        render(
            <ChartTooltip x={100} y={200}>
                Tooltip content
            </ChartTooltip>
        )

        expect(screen.getByText('Tooltip content')).toBeDefined()
    })

    it('applies correct position styles', () => {
        const { baseElement } = render(
            <ChartTooltip x={150} y={300}>
                Test
            </ChartTooltip>
        )

        const tooltip = baseElement.querySelector('[style*="left: 150px"]')
        expect(tooltip).not.toBeNull()
    })

    it('renders via portal — content is accessible in the document', () => {
        render(
            <ChartTooltip x={0} y={0}>
                Portal content
            </ChartTooltip>
        )

        expect(document.body.textContent).toContain('Portal content')
    })
})
