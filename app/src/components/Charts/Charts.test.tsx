import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Charts } from './Charts'
import React from 'react'

vi.mock('./StreamPerMonth', () => ({
    StreamPerMonth: () => (
        <div data-testid="stream-per-month">StreamPerMonth</div>
    ),
}))

vi.mock('./StreamPerHour', () => ({
    StreamPerHour: () => <div data-testid="stream-per-hour">StreamPerHour</div>,
}))

describe('Charts Component', () => {
    it('renders StreamPerMonth and StreamPerHour', () => {
        render(<Charts />)

        screen.getByTestId('stream-per-month')
        screen.getByTestId('stream-per-hour')
    })
})
