import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SummaryPerYear } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'

const queryResult = [
    { year: '2024', count_streams: 10131, type: 'new_unique' },
    { year: '2024', count_streams: 3861, type: 'new_repeat' },
    { year: '2024', count_streams: 17932, type: 'old_unique' },
    { year: '2025', count_streams: 1, type: 'old_repeat' },
]

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () => () => queryResult,
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('SummaryPerYear Component', () => {
    it('should render the svg', async () => {
        const { container } = render(
            <ThemeProvider>
                <SummaryPerYear year={2024} />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(3)
        })
        screen.getByText('Distribution of streams')
        screen.getByText('First Listen')
        screen.getByText('Repeats')
        screen.getByText('44% New Tracks')
        screen.getByText('56% Old Tracks')
    })
})
