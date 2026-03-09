import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar Component', () => {
    it('renders with correct width percentage', () => {
        const { container } = render(<ProgressBar pct={50} />)
        const innerBar = container.querySelector(
            '.h-2.rounded-full'
        ) as HTMLElement
        expect(innerBar).not.toBeNull()
        expect(innerBar.style.width).toBe('50%')
    })

    it('clamps percentage between 0 and 100', () => {
        const { container, rerender } = render(<ProgressBar pct={150} />)
        let innerBar = container.querySelector(
            '.h-2.rounded-full'
        ) as HTMLElement
        expect(innerBar.style.width).toBe('100%')

        rerender(<ProgressBar pct={-50} />)
        innerBar = container.querySelector('.h-2.rounded-full') as HTMLElement
        expect(innerBar.style.width).toBe('0%')
    })

    it('applies custom color and height', () => {
        const { container } = render(
            <ProgressBar pct={75} color="bg-red-500" height="h-4" />
        )
        const innerBar = container.querySelector(
            '.bg-red-500.h-4'
        ) as HTMLElement
        expect(innerBar).not.toBeNull()
        expect(innerBar.style.width).toBe('75%')
    })
})
