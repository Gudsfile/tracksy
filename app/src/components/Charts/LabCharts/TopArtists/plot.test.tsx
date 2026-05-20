import { describe, it, expect } from 'vitest'
import { buildPlot } from './plot'

const mockData = [
    { artist_name: 'Artist A', count_streams: 50, ms_played: 300000 },
    { artist_name: 'Artist B', count_streams: 30, ms_played: 200000 },
]

describe('TopArtists buildPlot', () => {
    it('renders with light theme', () => {
        const plot = buildPlot(mockData, false)
        expect(plot).toBeTruthy()
    })

    it('renders with dark theme', () => {
        const plot = buildPlot(mockData, true)
        expect(plot).toBeTruthy()
    })
})
