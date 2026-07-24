import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Results } from './Results'
import * as query from '../../db/queries/queryDB'
import * as db from '../../db/getDB'
import * as chatEngine from '../../hooks/useChatEngine'

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

        // Lab View stays mounted but hidden (no remount, avoids flicker #560):
        // its content is still in the DOM, but its tab panel is hidden.
        const labPanel = screen
            .getByText(/Work in Progress/i)
            .closest('[role="tabpanel"]')
        expect(labPanel?.hasAttribute('hidden')).toBe(true)
    })

    it('does not re-run queries when returning to a visited tab (#560)', async () => {
        render(<Results />)

        // Visit Lab, then Simple, then Lab again.
        const labButton = screen.getByRole('tab', { name: '🔬 Lab' })
        fireEvent.click(labButton)
        await screen.findByText(/Work in Progress/i, undefined, {
            timeout: 5000,
        })
        const callsAfterFirstVisit = vi.mocked(query.queryDBAsJSON).mock.calls
            .length

        fireEvent.click(screen.getByRole('tab', { name: '✨ Simple' }))
        fireEvent.click(labButton)

        // Panel stayed mounted, so no additional queries fire on re-entry.
        expect(vi.mocked(query.queryDBAsJSON).mock.calls.length).toBe(
            callsAfterFirstVisit
        )
    })

    it('keeps the chat conversation across a tab switch (#560)', async () => {
        // Force a ready engine so a message can be sent; `ask` is stubbed so
        // the submit resolves without loading the real LLM.
        vi.spyOn(chatEngine, 'useChatEngine').mockReturnValue({
            state: { kind: 'ready', isDegraded: false },
            ensureLoaded: vi.fn(),
            ask: vi.fn().mockResolvedValue({ payload: { kind: 'aborted' } }),
            cancel: vi.fn(),
        } as unknown as ReturnType<typeof chatEngine.useChatEngine>)
        // jsdom has no layout engine; the message list auto-scrolls on update.
        Element.prototype.scrollIntoView = vi.fn()

        render(<Results />)

        // Open the Chat tab (lazy-loaded) and send a message.
        fireEvent.click(screen.getByRole('tab', { name: '💬 Chat (beta)' }))
        const input = await screen.findByLabelText(
            'Ask the assistant',
            undefined,
            { timeout: 5000 }
        )
        fireEvent.change(input, { target: { value: 'remember me' } })
        fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
        await screen.findByText('remember me')

        // Switch away to Simple and back to Chat.
        fireEvent.click(screen.getByRole('tab', { name: '✨ Simple' }))
        fireEvent.click(screen.getByRole('tab', { name: '💬 Chat (beta)' }))

        // Panel stayed mounted, so the conversation survives the switch (no
        // remount wiping ChatView's message state).
        expect(screen.getByText('remember me')).toBeTruthy()
    })
})
