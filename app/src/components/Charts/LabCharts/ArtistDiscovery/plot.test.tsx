import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ArtistDiscoveryPlot } from './plot'

const mockData = [
    {
        year: 2020,
        cumulative_artists: 10,
        new_artists: 5,
        avg_listens_per_artist: 2.5,
    },
]

describe('ArtistDiscoveryPlot', () => {
    it('renders without crashing with empty data', () => {
        const { container } = render(<ArtistDiscoveryPlot data={[]} />)
        expect(container.querySelector('div')).toBeTruthy()
    })

    it('renders a plot with data', () => {
        const { container } = render(<ArtistDiscoveryPlot data={mockData} />)
        const svg = container.querySelector('svg')
        expect(svg).toBeTruthy()
    })
})
