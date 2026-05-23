import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatShortcuts } from './ChatShortcuts'

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
})
