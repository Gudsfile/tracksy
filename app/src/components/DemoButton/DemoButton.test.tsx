import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DemoButton } from './DemoButton'

describe('DemoButton', () => {
    it('renders the button', () => {
        render(
            <DemoButton label="↓" tooltip="Load demo" handleClick={vi.fn()} />
        )

        const button = screen.getByRole('button', {
            name: /↓/,
        })
        expect(button.getAttribute('title')).toBe('Load demo')
    })

    describe('when clicking on the button', () => {
        it('calls handleClick', () => {
            const handleClick = vi.fn()
            render(
                <DemoButton
                    label="↓"
                    tooltip="Load demo"
                    handleClick={handleClick}
                />
            )

            const button = screen.getByRole('button', {
                name: /↓/,
            })

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
    })
})
