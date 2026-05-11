import { describe, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListeningRhythm } from './ListeningRhythm'
import * as db from '../../../../db/queries/queryDB'

describe('ListeningRhythm Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<ListeningRhythm data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all values are zero', () => {
        render(
            <ListeningRhythm
                data={{
                    morning: 0,
                    afternoon: 0,
                    evening: 0,
                    night: 0,
                    total: 0,
                }}
                isLoading={false}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const mockData = {
            morning: 10,
            afternoon: 20,
            evening: 30,
            night: 40,
            total: 100,
        }

        vi.spyOn(db, 'queryDBAsJSON').mockResolvedValue([mockData])

        render(<ListeningRhythm data={mockData} />)

        screen.findByText('⏰ Listening Rhythm')
        screen.findByText('Morning (6‑11h)')
        screen.findByText('10.0%')
        screen.findByText('Night (22‑5h)')
        screen.findByText('40.0%')
    })
})
