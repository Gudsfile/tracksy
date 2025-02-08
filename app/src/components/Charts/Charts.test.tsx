import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Charts from './Charts'

vi.mock('./StreamPerMonth', () => ({
    default: () => <div data-testid="stream-per-month">StreamPerMonth</div>,
}))

describe('Charts Component', () => {
    it('renders StreamPerMonth and StreamPerHour', () => {
        render(<Charts />)

        screen.getByTestId('stream-per-month')
    })
})
