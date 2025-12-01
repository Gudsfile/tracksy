import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FavoriteWeekday } from './FavoriteWeekday'

describe('FavoriteWeekday Component', () => {
    const data = [
        { day_name: 'Monday', stream_count: 10, pct: 10 },
        { day_name: 'Tuesday', stream_count: 20, pct: 20 },
        { day_name: 'Wednesday', stream_count: 30, pct: 30 }, // Favorite
        { day_name: 'Thursday', stream_count: 15, pct: 15 },
        { day_name: 'Friday', stream_count: 10, pct: 10 },
        { day_name: 'Saturday', stream_count: 10, pct: 10 },
        { day_name: 'Sunday', stream_count: 5, pct: 5 },
    ]

    it('renders correctly and highlights favorite day', () => {
        render(<FavoriteWeekday data={data} />)
        screen.getByText('Wednesday')
        screen.getByText('30%')

        // Check if other days are rendered (mini calendar)
        screen.getByText('Mon')
        screen.getByText('Tue')
        screen.getByText('Wed')
        screen.getByText('Thu')
        screen.getByText('Fri')
        screen.getByText('Sat')
        screen.getByText('Sun')
    })
})
