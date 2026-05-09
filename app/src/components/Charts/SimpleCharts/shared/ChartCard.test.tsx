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
                <div>Child content</div>
            </ChartCard>
        )

        expect(screen.getByText('Child content')).toBeDefined()
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

    it('should render question when provided', () => {
        render(
            <ChartCard title="Test" question="What is my top artist?">
                Content
            </ChartCard>
        )

        expect(screen.getByText('What is my top artist?')).toBeDefined()
    })

    it('should not render question element when not provided', () => {
        render(<ChartCard title="Test">Content</ChartCard>)

        expect(screen.queryByText(/\?/)).toBeNull()
    })

    it('should render skeleton and hide children when isLoading is true', () => {
        render(
            <ChartCard title="Test" isLoading>
                <div>Content</div>
            </ChartCard>
        )

        expect(screen.queryByText('Content')).toBeNull()
        expect(document.querySelector('.animate-pulse')).not.toBeNull()
    })

    it('should render children and no skeleton when isLoading is false', () => {
        render(
            <ChartCard title="Test" isLoading={false}>
                <div>Content</div>
            </ChartCard>
        )

        expect(screen.getByText('Content')).toBeDefined()
        expect(document.querySelector('.animate-pulse')).toBeNull()
    })

    it('should render question even when isLoading is true', () => {
        render(
            <ChartCard title="Test" isLoading question="Loading question?">
                Content
            </ChartCard>
        )

        expect(screen.getByText('Loading question?')).toBeDefined()
    })
})
