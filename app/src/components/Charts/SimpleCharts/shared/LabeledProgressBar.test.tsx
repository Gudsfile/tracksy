import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LabeledProgressBar } from './LabeledProgressBar'

describe('LabeledProgressBar Component', () => {
    it('renders label, value and progress bar', () => {
        const { container } = render(
            <LabeledProgressBar label="Test Label" value="42%" pct={42} />
        )

        screen.getByText('Test Label')
        screen.getByText('42%')

        const innerBar = container.querySelector(
            '.h-2.rounded-full'
        ) as HTMLElement
        expect(innerBar).not.toBeNull()
        expect(innerBar.style.width).toBe('42%')
    })

    it('applies custom colors', () => {
        const { container } = render(
            <LabeledProgressBar
                label="Test Label"
                value="42%"
                pct={42}
                valueColor="text-red-500"
                barColor="bg-blue-500"
            />
        )

        const valueSpan = screen.getByText('42%')
        expect(valueSpan.className).toContain('text-red-500')

        const innerBar = container.querySelector('.bg-blue-500') as HTMLElement
        expect(innerBar).not.toBeNull()
        expect(innerBar.style.width).toBe('42%')
    })
})
