import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
    it('renders the stage label', () => {
        render(<ProgressBar stage="Fetching demo data…" percent={25} />)
        expect(screen.getByText('Fetching demo data…')).toBeDefined()
    })

    it('sets bar width to the given percent', () => {
        const { container } = render(
            <ProgressBar stage="Loading…" percent={60} />
        )
        const bar = container.querySelector('[style]') as HTMLElement
        expect(bar.style.width).toBe('60%')
    })

    it('renders at 0%', () => {
        const { container } = render(
            <ProgressBar stage="Starting…" percent={0} />
        )
        const bar = container.querySelector('[style]') as HTMLElement
        expect(bar.style.width).toBe('0%')
    })

    it('renders at 100%', () => {
        const { container } = render(<ProgressBar stage="Done" percent={100} />)
        const bar = container.querySelector('[style]') as HTMLElement
        expect(bar.style.width).toBe('100%')
    })

    it('exposes the progress to assistive tech', () => {
        render(<ProgressBar stage="Parsing records…" percent={60} />)
        const bar = screen.getByRole('progressbar')
        expect(bar.getAttribute('aria-valuenow')).toBe('60')
        expect(bar.getAttribute('aria-valuemin')).toBe('0')
        expect(bar.getAttribute('aria-valuemax')).toBe('100')
        expect(bar.getAttribute('aria-label')).toBe('Parsing records…')
    })

    it('can keep the stage as the accessible name without showing it', () => {
        render(
            <ProgressBar
                stage="Parsing records…"
                percent={60}
                showLabel={false}
            />
        )
        expect(screen.queryByText('Parsing records…')).toBe(null)
        expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe(
            'Parsing records…'
        )
    })
})
