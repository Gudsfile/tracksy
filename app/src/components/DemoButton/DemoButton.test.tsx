import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DemoButton } from './DemoButton'

describe('DemoButton', () => {
    it('renders the button', () => {
        render(<DemoButton label="Charger la démo" handleClick={vi.fn()} />)
        screen.getByRole('button', {
            name: /Charger la démo/,
        })
    })

    describe('when clicking on the button', () => {
        it('calls handleClick', () => {
            const handleClick = vi.fn()
            render(
                <DemoButton label="Charger la démo" handleClick={handleClick} />
            )

            const button = screen.getByRole('button', {
                name: /Charger la démo/,
            })

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
    })
})
