import { describe, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { TopStreak } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'
import * as queries from './query'

const topStreakData = [
    {
        streaks: 10,
        start_ts: new Date('2025-01-01'),
        end_ts: new Date('2025-01-10'),
    },
]

const currentStreakData = [
    {
        streaks: 3,
        start_ts: new Date('2025-10-17'),
        end_ts: new Date('2025-10-19'),
    },
]

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: (query: string) => {
        if (query === queries.queryTopStreak()) {
            return Promise.resolve(topStreakData)
        }
        if (query === queries.queryCurrentStreak()) {
            return Promise.resolve(currentStreakData)
        }
        return Promise.resolve([])
    },
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopStreak Component', () => {
    it('should render the top streak by default', async () => {
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

    it.skip('should render the current streak on hover', async () => {
        const { container } = render(
            <ThemeProvider>
                <TopStreak />
            </ThemeProvider>
        )

        fireEvent.mouseEnter(container.firstChild as ChildNode)

        await waitFor(() => {
            screen.getByText('3 🔥')
            screen.getByText('days in a row')
        })

        fireEvent.mouseLeave(container.firstChild as ChildNode)

        await waitFor(() => {
            screen.getByText('10 🔥')
            screen.getByText('days in a row')
        })
    })
})
