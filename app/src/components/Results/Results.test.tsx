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
        screen.getByRole('button', { name: 'Simple View' })
        screen.getByRole('button', { name: 'Expert View' })

        // Should default to Expert view
        // Expert View contains the "Work in Progress" section
        screen.getByText(/Work in Progress/i)
    })

    it('switches to simple view when Simple View button is clicked', async () => {
        render(<Results />)
        const simpleButton = screen.getByRole('button', {
            name: 'Simple View',
        })

        fireEvent.click(simpleButton)

        // Simple view content should be visible
        // Simple View contains specific charts like "Concentration Score" or just checking absent Expert content
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()

        // We can check if RangeSlider is present (common) but distinguishing is key.
        // SimpleView renders FunFacts.
        // But let's check for absence of Expert content first which proves switch.
    })

    it('switches to expert view when Expert View button is clicked', async () => {
        render(<Results />)

        // First switch to simple view
        const simpleButton = screen.getByRole('button', {
            name: 'Simple View',
        })
        fireEvent.click(simpleButton)
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()

        // Then switch back to expert view
        const expertButton = screen.getByRole('button', {
            name: 'Expert View',
        })
        fireEvent.click(expertButton)

        // Expert View content should be visible again
        screen.getByText(/Work in Progress/i)
    })
})
