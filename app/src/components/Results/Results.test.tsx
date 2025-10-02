import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Results } from './Results'

vi.mock('../Charts/Charts', () => ({
    Charts: () => <div data-testid="charts" />,
}))

describe('Results Component', () => {
    it('renders properly', () => {
        render(<Results />)

        // Check that both buttons are rendered
        expect(
            screen.getByRole('button', { name: /simple view/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /expert view/i })
        ).toBeInTheDocument()
    })

    it('switches to simple view when Simple View button is clicked', async () => {
        const user = userEvent.setup()
        render(<Results />)

        const simpleButton = screen.getByRole('button', {
            name: /simple view/i,
        })

        await user.click(simpleButton)

        // Simple view content should be visible
        expect(screen.getByText('simple view')).toBeInTheDocument()

        // Charts component should not be visible
        expect(screen.queryByTestId('charts')).not.toBeInTheDocument()
    })

    it('switches to expert view when Expert View button is clicked', async () => {
        const user = userEvent.setup()
        render(<Results />)

        // First switch to simple view
        const simpleButton = screen.getByRole('button', {
            name: /simple view/i,
        })
        await user.click(simpleButton)

        // Then switch back to expert view
        const expertButton = screen.getByRole('button', {
            name: /expert view/i,
        })
        await user.click(expertButton)

        // Charts component should be visible again
        expect(screen.getByTestId('charts')).toBeInTheDocument()

        // Simple view content should not be visible
        expect(screen.queryByText('simple view')).not.toBeInTheDocument()
    })
})
