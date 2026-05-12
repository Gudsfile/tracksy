import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VarietyDay } from './VarietyDay'

describe('VarietyDay Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<VarietyDay data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when artist_count is 0', () => {
        render(
            <VarietyDay
                data={{ artist_count: 0, date: '2025-01-01' }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders variety day data correctly', () => {
        render(<VarietyDay data={{ artist_count: 42, date: '2025-07-04' }} />)
        screen.getByRole('heading', { name: /🎨Eclectic Day/ })
        screen.getByText('42')
        screen.getByText('different artists')
        screen.getByText('July 4, 2025')
    })
})
