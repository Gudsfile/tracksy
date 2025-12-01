import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrincipalPlatform } from './PrincipalPlatform'

describe('PrincipalPlatform Component', () => {
    it('renders correctly with data', async () => {
        const data = [
            { platform: 'iOS', stream_count: 100, pct: 50 },
            { platform: 'Android', stream_count: 60, pct: 30 },
            { platform: 'Web', stream_count: 40, pct: 20 },
        ]

        render(<PrincipalPlatform data={data} />)

        screen.getByText('📱 Listening Devices')

        screen.getAllByText('iOS')
        screen.getAllByText('100 (50.0%)')
        screen.getAllByText('Android')
        screen.getAllByText('60 (30.0%)')
        screen.getAllByText('Web')
        screen.getAllByText('40 (20.0%)')
    })
})
