import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

import * as queries from './query'
import * as query from '../../../db/queries/queryDB'
import * as db from '../../../db/getDB'

import { TopStreak } from '.'

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

describe('TopStreak Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockImplementation((query) => {
            if (query === queries.queryTopStreak()) {
                return Promise.resolve(
                    topStreakData as unknown as queries.TopStreakQueryResult[]
                )
            }
            if (query === queries.queryCurrentStreak()) {
                return Promise.resolve(
                    currentStreakData as unknown as queries.TopStreakQueryResult[]
                )
            }
            return Promise.resolve(
                [] as unknown as queries.TopStreakQueryResult[]
            )
        })

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

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
