import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InsightList, InsightRow } from './InsightList'

describe('InsightList', () => {
    it('renders ul with correct classes', () => {
        const { container } = render(
            <InsightList>
                <InsightRow label="Label" value="Value" />
            </InsightList>
        )
        const ul = container.querySelector('ul')
        expect(ul).toBeTruthy()
        expect(ul?.className).toContain('border-t')
    })
})

describe('InsightRow', () => {
    it('renders label and value', () => {
        render(<InsightRow label="Total streams" value="1,234" />)
        expect(screen.getByText('Total streams')).toBeTruthy()
        expect(screen.getByText('1,234')).toBeTruthy()
    })

    it('accepts ReactNode as value', () => {
        render(
            <InsightRow
                label="Best streak"
                value={<span data-testid="node-value">42 days</span>}
            />
        )
        expect(screen.getByTestId('node-value')).toBeTruthy()
    })

    it('renders empty value span when value is null', () => {
        const { container } = render(<InsightRow label="Bingo" value={null} />)
        const valueSpan = container.querySelector('span.font-bold')
        expect(valueSpan).toBeTruthy()
        expect(valueSpan?.textContent).toBe('')
    })
})
