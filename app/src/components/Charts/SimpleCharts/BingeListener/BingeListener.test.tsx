import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BingeListener } from './BingeListener'

describe('BingeListener Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<BingeListener data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when hours_played is 0', () => {
        render(
            <BingeListener
                data={{ hours_played: 0, date: '2025-01-01' }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders binge day data correctly', () => {
        render(
            <BingeListener data={{ hours_played: 5.75, date: '2025-03-15' }} />
        )
        screen.getByRole('heading', { name: /🎧Deep Dive/ })
        screen.getByText('5.8')
        screen.getByText('hours in a day')
        screen.getByText('March 15, 2025')
    })
})
