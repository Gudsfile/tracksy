import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TopStreak } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () =>
        Promise.resolve([
            {
                streaks: 4,
                start_ts: new Date('2024-02-09'),
                end_ts: new Date('2024-02-12'),
            },
        ]),
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopStreak Component', () => {
    it('should render the text', async () => {
        render(
            <ThemeProvider>
                <TopStreak />
            </ThemeProvider>
        )

        await waitFor(() => {
            screen.getByText('10 🔥')
            screen.getByText('days in a row')
        })
    })
})
