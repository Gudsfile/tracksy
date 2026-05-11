import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrincipalPlatform } from './PrincipalPlatform'

describe('PrincipalPlatform Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<PrincipalPlatform data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when data is empty', () => {
        render(<PrincipalPlatform data={[]} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders single-platform message when only one platform', () => {
        render(
            <PrincipalPlatform
                data={[{ platform: 'iOS', stream_count: 100, pct: 100 }]}
                isLoading={false}
            />
        )
        screen.getByText('All streams are on iOS')
    })

    it('renders correctly with multiple platforms', () => {
        const data = [
            { platform: 'iOS', stream_count: 100, pct: 50 },
            { platform: 'Android', stream_count: 60, pct: 30 },
            { platform: 'Web', stream_count: 40, pct: 20 },
        ]

        render(<PrincipalPlatform data={data} />)

        screen.getByRole('heading', { name: /📱Your Sound Machine/ })
        expect(screen.getAllByText('iOS')).toHaveLength(2)
        screen.getByText(/100 streams/)
        screen.getByText('50.0%')
        screen.getByText('Android')
        screen.getByText('30.0%')
        screen.getByText('Web')
        screen.getByText('20.0%')
    })
})
