import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FavoriteWeekday } from './FavoriteWeekday'

describe('FavoriteWeekday Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<FavoriteWeekday data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    const data = [
        { day_name: 'Monday', stream_count: 10, ms_played: 600000, pct: 10 },
        { day_name: 'Tuesday', stream_count: 20, ms_played: 1200000, pct: 20 },
        {
            day_name: 'Wednesday',
            stream_count: 30,
            ms_played: 1800000,
            pct: 30,
        }, // Favorite
        { day_name: 'Thursday', stream_count: 15, ms_played: 900000, pct: 15 },
        { day_name: 'Friday', stream_count: 10, ms_played: 600000, pct: 10 },
        { day_name: 'Saturday', stream_count: 10, ms_played: 600000, pct: 10 },
        { day_name: 'Sunday', stream_count: 5, ms_played: 300000, pct: 5 },
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

    it('shows tooltip on bar hover', () => {
        render(<FavoriteWeekday data={data} />)

        const barElements = document.querySelectorAll('.overflow-hidden')
        expect(barElements.length).toBe(7)

        fireEvent.mouseEnter(barElements[0])

        expect(screen.getByText('Monday')).toBeDefined()
        expect(screen.getByText('10 streams')).toBeDefined()
        expect(screen.getByText('10m 0s')).toBeDefined()

        fireEvent.mouseLeave(barElements[0].parentElement!.parentElement!)
        expect(screen.queryByText('10 streams')).toBeNull()
    })
})
