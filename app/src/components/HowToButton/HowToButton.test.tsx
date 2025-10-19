import { render, screen } from '@testing-library/react'
import { describe, it, vi } from 'vitest'
import { HowToButton } from './HowToButton'

describe('DemoButton', () => {
    describe('when hovered', () => {
        it('renders the button with the full label', () => {
            render(
                <HowToButton
                    label="How to download your data?"
                    reducedLabel={'?'}
                    isHovered={true}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )
            screen.getByRole('link', {
                name: /How to download your data\?/,
            })
        })
    })
    describe('when not hovered', () => {
        it('renders the button with the reduced label', () => {
            render(
                <HowToButton
                    label="How to download your data?"
                    reducedLabel={'?'}
                    isHovered={true}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )
            screen.getByRole('link', {
                name: /\?/,
            })
        })
    })

    describe('when clicking on the button', () => {
        it('calls handleClick', () => {
            render(
                <HowToButton
                    label="How to download your data?"
                    reducedLabel={'?'}
                    isHovered={true}
                    onMouseEnter={vi.fn()}
                    onMouseLeave={vi.fn()}
                />
            )

            screen.getByRole('link', {
                name: /How to download your data\?/,
            })
        })
    })
})
