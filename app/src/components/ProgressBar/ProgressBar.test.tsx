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
})
