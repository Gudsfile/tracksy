import { describe, it, expect } from 'vitest'
import { buildPlot } from './plot'
import type { SessionAnalysisDetailedResult } from './query'

const mockData: SessionAnalysisDetailedResult[] = [
    {
        session_id: 1,
        track_count: 5,
        duration_ms: 1800000,
        session_start: '2025-01-10T20:00:00',
        session_end: '2025-01-10T20:30:00',
        day_of_week: 5,
        start_hour: 20,
    },
    {
        session_id: 2,
        track_count: 8,
        duration_ms: 3600000,
        session_start: '2025-01-15T21:00:00',
        session_end: '2025-01-15T22:00:00',
        day_of_week: 3,
        start_hour: 21,
    },
]

describe('SessionAnalysis buildPlot', () => {
    it('renders with light theme', () => {
        const container = buildPlot(mockData, false)
        expect(container).toBeTruthy()
        expect(container.className).toBe('space-y-4 p-4')
    })

    it('renders with dark theme', () => {
        const container = buildPlot(mockData, true)
        expect(container).toBeTruthy()
        expect(container.className).toBe('space-y-4 p-4')
    })
})
