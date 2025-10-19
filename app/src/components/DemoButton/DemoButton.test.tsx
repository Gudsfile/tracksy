import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DemoButton } from './DemoButton'

describe('DemoButton', () => {
    describe('when hovered', () => {
        it('renders the button with the full label', () => {
            render(
                <DemoButton
                    label="Load demo"
                    handleClick={vi.fn()}
                    reducedLabel={'↓'}
                    isHovered={true}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )
            screen.getByRole('button', {
                name: /Load demo/,
            })
        })
    })

    describe('when not hovered', () => {
        it('renders the button with the reduced label', () => {
            render(
                <DemoButton
                    label="Load demo"
                    handleClick={vi.fn()}
                    reducedLabel={'↓'}
                    isHovered={false}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )
            screen.getByRole('button', {
                name: /↓/,
            })
        })
    })

    describe('when clicking on the button', () => {
        it('calls handleClick', () => {
            const handleClick = vi.fn()
            render(
                <DemoButton
                    label="Load demo"
                    handleClick={handleClick}
                    reducedLabel={'↓'}
                    isHovered={true}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )

            const button = screen.getByRole('button', {
                name: /Load demo/,
            })

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
    })
})
