import { describe, it, expect } from 'vitest'
import { buildPlot } from './plot'

const mockData = [
    { day_of_week: 1, hour: 10, count_streams: 5 },
    { day_of_week: 2, hour: 14, count_streams: 8 },
]

describe('StreamPerDayOfWeek buildPlot', () => {
    it('renders with light theme', () => {
        const plot = buildPlot(mockData, false)
        expect(plot).toBeTruthy()
    })

    it('renders with dark theme', () => {
        const plot = buildPlot(mockData, true)
        expect(plot).toBeTruthy()
    })
})
