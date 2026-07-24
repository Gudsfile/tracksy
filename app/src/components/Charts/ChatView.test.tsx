import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChatView } from './ChatView'

describe('ChatView', () => {
    it('uses the full container width like the other tabs', () => {
        const { container } = render(<ChatView />)

        const root = container.firstChild as HTMLElement
        expect(root).toBeTruthy()
        // The Chat tab must not constrain its content to a narrower width than
        // the other tabs (see issue #431).
        expect(root.className).not.toMatch(/max-w-/)
    })
})
