import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UnbeatableStreak } from './UnbeatableStreak'

describe('UnbeatableStreak Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<UnbeatableStreak data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when streak_days is 0', () => {
        render(
            <UnbeatableStreak
                data={{
                    streak_days: 0,
                    start_date: '2025-01-01',
                    end_date: '2025-01-01',
                }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders streak data correctly', () => {
        render(
            <UnbeatableStreak
                data={{
                    streak_days: 14,
                    start_date: '2025-01-12',
                    end_date: '2025-01-25',
                }}
            />
        )
        screen.getByRole('heading', { name: /🔥On a Roll/ })
        screen.getByText('14')
        screen.getByText('days in a row')
        screen.getByText(/Jan 12/)
        screen.getByText(/Jan 25/)
    })
})
