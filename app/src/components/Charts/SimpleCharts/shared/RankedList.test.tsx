import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RankedList } from './RankedList'

describe('RankedList Component', () => {
    it('renders a list of ranked items', () => {
        const items = [
            { primary: 'Item 1', secondary: 'Sub 1', score: '100' },
            { primary: 'Item 2', score: '90' },
            { primary: 'Item 3', secondary: 'Sub 3', score: '80' },
            { primary: 'Item 4', score: '70' },
            { primary: 'Item 5', score: '60' },
            { primary: 'Item 6', score: '50' },
        ]

        render(<RankedList items={items} />)

        const listItems = screen.getAllByRole('listitem')
        expect(listItems).toHaveLength(6)

        expect(listItems[0].textContent).toContain('🥇')
        expect(listItems[0].textContent).toContain('Item 1')
        expect(listItems[0].textContent).toContain('Sub 1')
        expect(listItems[0].textContent).toContain('100')

        expect(listItems[1].textContent).toContain('🥈')
        expect(listItems[1].textContent).toContain('Item 2')
        expect(listItems[1].textContent).not.toContain('Sub 1')
        expect(listItems[1].textContent).toContain('90')

        // Last item should not have ranking emoji (array has 5)
        expect(listItems[5].textContent).not.toContain('🥇')
        expect(listItems[5].textContent).not.toContain('🥈')
        expect(listItems[5].textContent).not.toContain('🥉')
        expect(listItems[5].textContent).not.toContain('4️⃣')
        expect(listItems[5].textContent).not.toContain('5️⃣')
        expect(listItems[5].textContent).toContain('Item 6')
        expect(listItems[5].textContent).toContain('50')
    })
})
