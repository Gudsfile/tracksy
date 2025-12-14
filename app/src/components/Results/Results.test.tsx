import { describe, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Results } from './Results'
import * as db from '../../db/queries/queryDB'

// Mock the child components to avoid needing to mock all their data dependencies
vi.mock('../Charts/ExpertView', () => ({
    ExpertView: () => (
        <div data-testid="charts-component">Expert View Content</div>
    ),
}))

vi.mock('../Charts/SimpleView', () => ({
    SimpleView: () => <div data-testid="simple-view" />,
}))

describe('Results Component', () => {
    it('renders properly', () => {
        vi.spyOn(db, 'queryDBAsJSON').mockImplementation(() => {
            return Promise.resolve([])
        })
        render(<Results />)
        screen.getByRole('button', { name: 'Simple View' })
        screen.getByRole('button', { name: 'Expert View' })
    })

    it('switches view when button is clicked', () => {
        vi.spyOn(db, 'queryDBAsJSON').mockImplementation(() => {
            return Promise.resolve([])
        })
        render(<Results />)
        screen.getByTestId('charts')

        const simpleButton = screen.getByRole('button', {
            name: 'Simple View',
        })
        fireEvent.click(simpleButton)
        screen.getByTestId('simple-view')

        const expertButton = screen.getByRole('button', {
            name: 'Expert View',
        })
        fireEvent.click(expertButton)
        screen.getByTestId('charts')
    })
})
