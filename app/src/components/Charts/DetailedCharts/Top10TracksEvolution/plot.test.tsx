import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Top10TracksEvolutionPlot } from './plot'

const mockData = [
    {
        year: 2020,
        track: 'Track A',
        artist: 'Artist A',
        rank: 1,
        play_count: 100,
    },
    {
        year: 2020,
        track: 'Track B',
        artist: 'Artist B',
        rank: 2,
        play_count: 80,
    },
    {
        year: 2021,
        track: 'Track A',
        artist: 'Artist A',
        rank: 2,
        play_count: 90,
    },
]

describe('Top10TracksEvolutionPlot', () => {
    it('renders without crashing with empty data', () => {
        const { container } = render(<Top10TracksEvolutionPlot data={[]} />)
        expect(container.querySelector('div')).toBeTruthy()
    })

    it('renders a plot with data', () => {
        const { container } = render(
            <Top10TracksEvolutionPlot data={mockData} />
        )
        const svg = container.querySelector('svg')
        expect(svg).toBeTruthy()
    })
})
