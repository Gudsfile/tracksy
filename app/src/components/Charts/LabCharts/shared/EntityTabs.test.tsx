import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EntityTabs } from './EntityTabs'

describe('EntityTabs', () => {
    it('renders 3 buttons with correct labels', () => {
        render(<EntityTabs value="artists" onChange={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Artists' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Tracks' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Albums' })).toBeTruthy()
    })

    it('active button has blue background class', () => {
        render(<EntityTabs value="tracks" onChange={vi.fn()} />)
        const tracksBtn = screen.getByRole('button', { name: 'Tracks' })
        const artistsBtn = screen.getByRole('button', { name: 'Artists' })
        expect(tracksBtn.className).toContain('bg-blue-500')
        expect(artistsBtn.className).not.toContain('bg-blue-500')
    })

    it('clicking inactive button calls onChange with correct EntityType', () => {
        const onChange = vi.fn()
        render(<EntityTabs value="artists" onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: 'Albums' }))
        expect(onChange).toHaveBeenCalledWith('albums')
    })
})
