import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatShortcuts } from './ChatShortcuts'

const GENERATED = [
    { label: 'After midnight', question: 'What do I play after 1am?' },
    {
        label: 'Sunday mornings',
        question: 'What do I play on Sunday mornings?',
    },
]

describe('ChatShortcuts', () => {
    it('renders all 6 shortcut chips', () => {
        render(<ChatShortcuts onSelect={vi.fn()} />)
        expect(screen.getByText('Top artists')).toBeTruthy()
        expect(screen.getByText('Late night')).toBeTruthy()
        expect(screen.getByText('Season trends')).toBeTruthy()
        expect(screen.getByText('Most replayed')).toBeTruthy()
        expect(screen.getByText('Peak day')).toBeTruthy()
        expect(screen.getByText('Discovery')).toBeTruthy()
    })

    it('calls onSelect with the correct question when a chip is clicked', () => {
        const onSelect = vi.fn()
        render(<ChatShortcuts onSelect={onSelect} />)

        fireEvent.click(screen.getByText('Top artists'))
        expect(onSelect).toHaveBeenCalledWith(
            'Who are my top 5 most listened to artists?'
        )

        fireEvent.click(screen.getByText('Season trends'))
        expect(onSelect).toHaveBeenCalledWith(
            'How does my listening change by season?'
        )
    })

    it('disables all chips when disabled=true', () => {
        const onSelect = vi.fn()
        render(<ChatShortcuts onSelect={onSelect} disabled />)

        const buttons = screen.getAllByRole('button')
        for (const btn of buttons) {
            expect((btn as HTMLButtonElement).disabled).toBe(true)
        }

        fireEvent.click(screen.getByText('Top artists'))
        expect(onSelect).not.toHaveBeenCalled()
    })

    it('renders generated suggestions in place of the static chips', () => {
        render(<ChatShortcuts onSelect={vi.fn()} suggestions={GENERATED} />)

        expect(screen.getByText('After midnight')).toBeTruthy()
        expect(screen.getByText('Sunday mornings')).toBeTruthy()
        expect(screen.queryByText('Top artists')).toBeNull()
        expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('submits the full generated question, not the short label', () => {
        const onSelect = vi.fn()
        render(<ChatShortcuts onSelect={onSelect} suggestions={GENERATED} />)

        fireEvent.click(screen.getByText('After midnight'))
        expect(onSelect).toHaveBeenCalledWith('What do I play after 1am?')
    })

    it('falls back to the static chips when suggestions are empty', () => {
        render(<ChatShortcuts onSelect={vi.fn()} suggestions={[]} />)
        expect(screen.getByText('Top artists')).toBeTruthy()
        expect(screen.getAllByRole('button')).toHaveLength(6)
    })

    it('still renders chips while a new set is generating', () => {
        render(
            <ChatShortcuts
                onSelect={vi.fn()}
                suggestions={GENERATED}
                isGenerating
            />
        )
        // The row must never go blank mid-generation — it would shift layout.
        expect(screen.getAllByRole('button')).toHaveLength(2)
    })
})
