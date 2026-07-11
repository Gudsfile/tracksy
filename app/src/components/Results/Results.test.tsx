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
        screen.getByRole('tab', { name: '⌨️ Query' })

        // Simple default to Simple view
        // Simple View contains specific charts like "Concentration Score" or just checking absent Lab content
        // Lab View contains the "Work in Progress" section
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()
    })

    it('switches to lab view when Lab button is clicked', async () => {
        render(<Results />)
        const labButton = screen.getByRole('tab', {
            name: '🔬 Lab',
        })

        fireEvent.click(labButton)

        // Lab view is lazy-loaded; wait for it (slow CI runners need > 1s)
        await screen.findByText(/Work in Progress/i, undefined, {
            timeout: 5000,
        })
    })

    it('switches to query view when Query button is clicked', async () => {
        render(<Results />)

        fireEvent.click(screen.getByRole('tab', { name: '⌨️ Query' }))

        await screen.findByText('⌨️ DuckDB Shell', undefined, {
            timeout: 5000,
        })
    })

    it('switches back to simple view from lab view', async () => {
        render(<Results />)

        // First switch to lab view
        const labButton = screen.getByRole('tab', {
            name: '🔬 Lab',
        })
        fireEvent.click(labButton)
        await screen.findByText(/Work in Progress/i, undefined, {
            timeout: 5000,
        })

        // Then switch back to simple view
        const simpleButton = screen.getByRole('tab', {
            name: '✨ Simple',
        })
        fireEvent.click(simpleButton)

        // Lab View content should not be visible again
        expect(screen.queryByText(/Work in Progress/i)).toBeNull()
    })
})
