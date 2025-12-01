import { describe, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { TopStreak } from '.'
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
        render(<TopStreak />)

        await waitFor(() => {
            screen.getByText('10')
            screen.getByText('🔥')
            screen.getByText('days in a row')
        })
    })

    it('should render the current streak on click', async () => {
        render(<TopStreak />)

        await waitFor(() => {
            screen.getByText('10')
            screen.getByText('🔥')
            screen.getByText('days in a row')
        })

        const button = screen.getByRole('button')

        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('3')
            screen.getByText('🔥')
            screen.getByText('days in a row')
        })

        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('10')
            screen.getByText('🔥')
            screen.getByText('days in a row')
        })
    })
})
