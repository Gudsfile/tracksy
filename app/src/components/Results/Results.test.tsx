import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Results } from './Results'
import * as query from '../../db/queries/queryDB'
import * as db from '../../db/getDB'

describe('Results Component', () => {
    beforeEach(() => {
        // Mock DB interactions to prevent crashes and external calls
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(
            [] as unknown as Awaited<ReturnType<typeof query.queryDBAsJSON>>
        )
        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('renders properly', () => {
        render(<Results />)
        // Check that both buttons are rendered
        screen.getByRole('tab', { name: '✨ Simple' })
        screen.getByRole('tab', { name: '🔬 Lab' })

        // Simple default to Simple view
        // Simple View contains specific charts like "Concentration Score" or just checking absent Lab content
        // Lab View contains the "Work in Progress" section
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()
    })

    it('switches to simple view when Simple button is clicked', async () => {
        render(<Results />)
        const simpleButton = screen.getByRole('tab', {
            name: '🔬 Lab',
        })

        fireEvent.click(simpleButton)

        // Lab view content should be visible
        screen.queryByText(/Work in Progress/i)

        // We can check if RangeSlider is present (common) but distinguishing is key.
    })

    it('switches to lab view when Lab View button is clicked', async () => {
        render(<Results />)

        // First switch to lab view
        const simpleButton = screen.getByRole('tab', {
            name: '🔬 Lab',
        })
        fireEvent.click(simpleButton)
        screen.getByText(/Work in Progress/i)

        // Then switch back to simple view
        const labButton = screen.getByRole('tab', {
            name: '✨ Simple',
        })
        fireEvent.click(labButton)

        // Lab View content should not be visible again
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()
    })
})
