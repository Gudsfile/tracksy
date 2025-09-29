import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DemoButton } from './DemoButton'

describe('DemoButton', () => {
    it('renders the button', () => {
        render(<DemoButton label="Load demo" handleClick={vi.fn()} />)
        screen.getByRole('button', {
            name: /Load demo/,
        })
    })

    describe('when clicking on the button', () => {
        it('calls handleClick', () => {
            const handleClick = vi.fn()
            render(<DemoButton label="Load demo" handleClick={handleClick} />)

            const button = screen.getByRole('button', {
                name: /Load demo/,
            })

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
    })
})
