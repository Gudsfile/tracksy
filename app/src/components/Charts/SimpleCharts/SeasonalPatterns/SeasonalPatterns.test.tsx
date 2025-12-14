import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeasonalPatterns } from './SeasonalPatterns'
import * as db from '../../../../db/queries/queryDB'

describe('SeasonalPatterns Component', () => {
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

        screen.getByText('🌺 Seasonal patterns')

        screen.getByText('Winter ❄️')
        screen.getByText('10.0%')
        screen.getByText('Spring 🌸')
        screen.getByText('20.0%')
        screen.getByText('Summer ☀️')
        screen.getByText('30.0%')
        screen.getByText('Fall 🍂')
        screen.getByText('40.0%')
    })
})
