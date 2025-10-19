import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HowToButton } from './HowToButton'

describe('HowToButton', () => {
    it('renders the button', () => {
        render(<HowToButton label="?" tooltip="How to download your data?" />)

        const link = screen.getByRole('link', {
            name: /\?/,
        })

        expect(link.getAttribute('title')).toBe('How to download your data?')
    })
})
