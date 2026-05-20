import { describe, it, expect } from 'vitest'
import { buildPlot } from './plot'
import type { StreamPerMonthQueryResult } from './query'

const mockData: StreamPerMonthQueryResult[] = [
    { ts: 1, ms_played: 30, count_streams: 5 },
    { ts: 2, ms_played: 50, count_streams: 8 },
]

describe('StreamPerMonth buildPlot', () => {
    it('renders without crashing when maxValue is provided', () => {
        const plot = buildPlot([], 50, false)
        expect(plot).toBeTruthy()
    })

    it('renders without crashing when maxValue is undefined and data has values', () => {
        const plot = buildPlot(mockData, undefined, false)
        expect(plot).toBeTruthy()
    })

    it('renders without crashing when maxValue is undefined and data is empty', () => {
        const plot = buildPlot([], undefined, false)
        expect(plot).toBeTruthy()
    })

    it('renders without crashing when maxValue is 0 and data is empty', () => {
        const plot = buildPlot([], 0, false)
        expect(plot).toBeTruthy()
    })

    it('renders without crashing with isDark true', () => {
        const plot = buildPlot([], 50, true)
        expect(plot).toBeTruthy()
    })
})
