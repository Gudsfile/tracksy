import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Results } from './Results'

vi.mock('../Charts/Charts', () => ({
    Charts: () => <div data-testid="charts" />,
}))

describe('Results Component', () => {
    it('renders properly', () => {
        render(<Results />)
        // Check that both buttons are rendered
        screen.getByRole('button', { name: 'Simple View' })
        screen.getByRole('button', { name: 'Expert View' })
    })

    it('switches to simple view when Simple View button is clicked', () => {
        render(<Results />)
        const simpleButton = screen.getByRole('button', {
            name: 'Simple View',
        })

        fireEvent.click(simpleButton)

        // Simple view content should be visible
        screen.getByText('simple view')
        // Charts component should not be visible
        expect(screen.queryByTestId('charts')).toBeNull()
    })

    it('switches to expert view when Expert View button is clicked', () => {
        render(<Results />)

        // First switch to simple view
        const simpleButton = screen.getByRole('button', {
            name: 'Simple View',
        })
        fireEvent.click(simpleButton)

        // Then switch back to expert view
        const expertButton = screen.getByRole('button', {
            name: 'Expert View',
        })
        fireEvent.click(expertButton)

        // Charts component should be visible again
        screen.getByTestId('charts')
        // Simple view content should not be visible
        expect(screen.queryByText('simple view')).toBeNull()
    })
})
