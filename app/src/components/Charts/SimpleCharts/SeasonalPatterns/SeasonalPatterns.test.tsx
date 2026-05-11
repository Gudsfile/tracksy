import { describe, it, vi, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeasonalPatterns } from './SeasonalPatterns'
import * as db from '../../../../db/queries/queryDB'

describe('SeasonalPatterns Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<SeasonalPatterns data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all values are zero', () => {
        render(
            <SeasonalPatterns
                data={{ winter: 0, spring: 0, summer: 0, fall: 0, total: 0 }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const mockData = {
            winter: 10,
            spring: 20,
            summer: 30,
            fall: 40,
            total: 100,
        }

        vi.spyOn(db, 'queryDBAsJSON').mockResolvedValue([mockData])

        render(<SeasonalPatterns data={mockData} />)

        screen.getByRole('heading', { name: /🌺Seasonal Mood/ })
        screen.getByText('🍂')
        screen.getByText('40 streams')
        screen.getByText('Winter')
        screen.getByText('10.0%')
        screen.getByText('Spring')
        screen.getByText('20.0%')
        screen.getByText('Summer')
        screen.getByText('30.0%')
        expect(screen.getAllByText('Fall')).toHaveLength(2)
        screen.getByText('40.0%')
    })

    it('renders with non-monotonic values to cover reduce > branch', () => {
        render(
            <SeasonalPatterns
                data={{
                    winter: 40,
                    spring: 10,
                    summer: 30,
                    fall: 20,
                    total: 100,
                }}
            />
        )
        expect(screen.getAllByText('Winter')).toHaveLength(2)
        screen.getByText('40.0%')
    })
})
