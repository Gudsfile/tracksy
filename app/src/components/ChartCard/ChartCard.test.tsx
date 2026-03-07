import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChartCard } from './ChartCard'

describe('ChartCard', () => {
    it('should render title', () => {
        render(<ChartCard title="Test Title">Content</ChartCard>)

        expect(
            screen.getByRole('heading', { name: 'Test Title' })
        ).toBeDefined()
    })

    it('should render emoji when provided', () => {
        render(
            <ChartCard title="Test" emoji="🎵">
                Content
            </ChartCard>
        )

        expect(screen.getByText('🎵')).toBeDefined()
    })

    it('should render children', () => {
        render(
            <ChartCard title="Test">
                <div data-testid="children">Child content</div>
            </ChartCard>
        )

        expect(screen.getByTestId('children')).toBeDefined()
    })

    it('should apply custom className', () => {
        const { container } = render(
            <ChartCard title="Test" className="custom-class">
                Content
            </ChartCard>
        )

        expect(container.firstChild?.className).toContain('custom-class')
    })

    it('should have correct base classes', () => {
        const { container } = render(
            <ChartCard title="Test">Content</ChartCard>
        )

        const classes = (container.firstChild as Element).className
        expect(classes).toContain('group')
        expect(classes).toContain('p-6')
        expect(classes).toContain('bg-white')
        expect(classes).toContain('backdrop-blur-md')
        expect(classes).toContain('rounded-2xl')
        expect(classes).toContain('animate-fade-in')
    })
})
