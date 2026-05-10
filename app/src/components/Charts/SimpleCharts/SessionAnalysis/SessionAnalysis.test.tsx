import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionAnalysis } from './SessionAnalysis'

const baseData = {
    session_count: 42,
    avg_duration_ms: 600000,
    median_tracks: 6,
    longest_session_ms: 1800000,
    longest_session_track_count: 15,
    longest_session_date: '2025-01-10T20:00:00',
    peak_start_hour: 20,
}

describe('SessionAnalysis Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<SessionAnalysis data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders Express profile for short average sessions', () => {
        render(<SessionAnalysis data={baseData} />)
        expect(screen.getByText('Express')).toBeTruthy()
        expect(screen.getByText('42 sessions')).toBeTruthy()
    })

    it('renders Balanced profile for medium average sessions', () => {
        render(
            <SessionAnalysis data={{ ...baseData, avg_duration_ms: 2400000 }} />
        )
        expect(screen.getByText('Balanced')).toBeTruthy()
    })

    it('renders Marathon profile for long average sessions', () => {
        render(
            <SessionAnalysis data={{ ...baseData, avg_duration_ms: 7200000 }} />
        )
        expect(screen.getByText('Marathon')).toBeTruthy()
    })

    it('renders Balanced at exactly the Express upper boundary (1 200 000 ms)', () => {
        render(
            <SessionAnalysis data={{ ...baseData, avg_duration_ms: 1200000 }} />
        )
        expect(screen.getByText('Balanced')).toBeTruthy()
    })

    it('renders Marathon at exactly the Balanced upper boundary (3 600 000 ms)', () => {
        render(
            <SessionAnalysis data={{ ...baseData, avg_duration_ms: 3600000 }} />
        )
        expect(screen.getByText('Marathon')).toBeTruthy()
    })

    it('renders peak start hour', () => {
        render(<SessionAnalysis data={baseData} />)
        expect(screen.getByText(/20h/)).toBeTruthy()
    })

    it('renders the longest session date', () => {
        render(<SessionAnalysis data={baseData} />)
        const expectedDate = new Date(
            baseData.longest_session_date
        ).toLocaleDateString()
        expect(screen.getByText(new RegExp(expectedDate))).toBeTruthy()
    })

    it('renders skeleton and title when loading', () => {
        render(<SessionAnalysis data={undefined} isLoading />)
        expect(screen.getByText('Listening sessions')).toBeTruthy()
    })
})
