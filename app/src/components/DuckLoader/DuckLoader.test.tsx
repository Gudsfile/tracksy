import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DuckLoader } from './DuckLoader'

describe('DuckLoader', () => {
    it('exposes the stage as a live status', () => {
        render(<DuckLoader stage="Waking the duck…" />)
        expect(screen.getByRole('status').textContent).toBe('Waking the duck…')
    })

    it('hides the duck from assistive tech', () => {
        const { container } = render(<DuckLoader stage="Waking the duck…" />)
        // Screen readers announce 🦆 as "duck", which would talk over the status.
        const decorative = container.querySelector('[aria-hidden="true"]')
        expect(decorative?.textContent).toContain('🦆')
    })

    it('renders a progress bar carrying the percent', () => {
        render(<DuckLoader stage="Teaching it to swim…" percent={62} />)
        const bar = screen.getByRole('progressbar')
        expect(bar.getAttribute('aria-valuenow')).toBe('62')
        expect(bar.getAttribute('aria-valuemax')).toBe('100')
    })

    it('omits the bar when no percent is known', () => {
        render(<DuckLoader stage="Waking the duck…" percent={null} />)
        expect(screen.queryByRole('progressbar')).toBe(null)
    })

    it('does not repeat the stage text alongside the bar', () => {
        render(<DuckLoader stage="Teaching it to swim…" percent={62} />)
        expect(screen.getAllByText('Teaching it to swim…')).toHaveLength(1)
    })

    it('replaces the status with an alert on failure', () => {
        render(
            <DuckLoader
                stage="Teaching it to swim…"
                error={new Error('boom')}
            />
        )
        expect(screen.getByRole('alert').textContent).toContain(
            'The database engine failed to start.'
        )
        expect(screen.queryByRole('status')).toBe(null)
    })

    it('calls onRetry when the retry button is pressed', () => {
        const onRetry = vi.fn()
        render(
            <DuckLoader
                stage="Teaching it to swim…"
                error={new Error('boom')}
                onRetry={onRetry}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('omits the retry button when there is nothing to retry', () => {
        render(<DuckLoader stage="Teaching it to swim…" error={new Error()} />)
        expect(screen.queryByRole('button', { name: 'Retry' })).toBe(null)
    })

    it('keeps the failure message available so it can be reported', () => {
        const { container } = render(
            <DuckLoader
                stage="Teaching it to swim…"
                error={new Error('Failed to fetch duckdb-eh.wasm')}
            />
        )
        // Tucked into a <details> so it stays out of the way until asked for.
        const details = container.querySelector('details')
        expect(details?.textContent).toContain('Failed to fetch duckdb-eh.wasm')
    })

    it('stops animating the duck on failure', () => {
        const { container } = render(
            <DuckLoader stage="Teaching it to swim…" error={new Error()} />
        )
        expect(container.querySelector('.animate-duck-bob')).toBe(null)
    })

    it('hides the ripples rather than freezing them mid-animation', () => {
        // Their keyframes have no resting state, so an unanimated ripple is an
        // opaque ring at full scale — not a faded-out one.
        const { container, rerender } = render(
            <DuckLoader stage="Waking the duck…" />
        )
        const ripples = container.querySelectorAll('.animate-duck-ripple')
        expect(ripples).toHaveLength(2)
        ripples.forEach((ripple) =>
            expect(ripple.className).toContain('motion-reduce:hidden')
        )

        rerender(<DuckLoader stage="Waking the duck…" error={new Error()} />)
        const decorative = container.querySelector('[aria-hidden="true"]')
        expect(container.querySelector('.animate-duck-ripple')).toBe(null)
        expect(decorative?.querySelectorAll('.hidden')).toHaveLength(2)
    })

    it('guards the entrance animation for reduced motion', () => {
        // Safe to drop rather than hide: fadeIn runs opacity 0→1 with no
        // forwards, so with no animation the loader sits at full opacity.
        const { container } = render(<DuckLoader stage="Waking the duck…" />)
        expect(
            container.querySelector('.animate-fade-in')?.className
        ).toContain('motion-reduce:animate-none')
    })
})
