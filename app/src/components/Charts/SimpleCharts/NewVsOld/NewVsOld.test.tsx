import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewVsOld } from './NewVsOld'

describe('NewVsOld Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<NewVsOld data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const data = {
            new_artists_streams: 30,
            old_artists_streams: 70,
            new_artists_count: 5,
            total: 100,
        }

        render(<NewVsOld data={data} />)

        screen.getByRole('heading', { name: /🆕Fresh vs Familiar/ })
        screen.getByText('30%')
        screen.getByText('70%')
        screen.getByText(/5 new artists discovered/)
    })
})
