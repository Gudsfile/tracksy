import { describe, it, expect } from 'vitest'
import { buildPlot } from './plot'

const mockData = [
    { album_name: 'Album A', count_streams: 50, ms_played: 300000 },
    { album_name: 'Album B', count_streams: 30, ms_played: 200000 },
]

describe('TopAlbums buildPlot', () => {
    it('renders with light theme', () => {
        const plot = buildPlot(mockData, false)
        expect(plot).toBeTruthy()
    })

    it('renders with dark theme', () => {
        const plot = buildPlot(mockData, true)
        expect(plot).toBeTruthy()
    })
})
