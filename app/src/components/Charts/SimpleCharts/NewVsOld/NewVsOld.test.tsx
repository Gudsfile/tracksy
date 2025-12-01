import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewVsOld } from './NewVsOld'

describe('NewVsOld Component', () => {
    it('renders correctly with data', async () => {
        const data = {
            new_artists_streams: 30,
            old_artists_streams: 70,
            new_artists_count: 5,
            total: 100,
        }

        render(<NewVsOld data={data} />)

        screen.getByText('🆕 New vs Old')
        screen.getByText('30%')
        screen.getByText('70%')
        screen.getByText('5')
    })
})
