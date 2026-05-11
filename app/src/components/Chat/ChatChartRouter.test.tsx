import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatChartRouter } from './ChatChartRouter'
import type { ChatAnswer } from '../../llm/types'

// Spy on each chart component to avoid DuckDB / DOM heavy lifting
import * as TopArtistsModule from '../Charts/SimpleCharts/TopArtists'
import * as TopTracksModule from '../Charts/SimpleCharts/TopTracks'
import * as TopAlbumsModule from '../Charts/SimpleCharts/TopAlbums'
import * as CalendarHeatmapModule from '../Charts/SimpleCharts/CalendarHeatmap'
import * as SessionAnalysisModule from '../Charts/SimpleCharts/SessionAnalysis'
import * as ListeningRhythmModule from '../Charts/SimpleCharts/ListeningRhythm'
import * as SkipRateModule from '../Charts/SimpleCharts/SkipRate'
import * as RegularityModule from '../Charts/SimpleCharts/Regularity'
import * as NewVsOldModule from '../Charts/SimpleCharts/NewVsOld'
import * as FavoriteWeekdayModule from '../Charts/SimpleCharts/FavoriteWeekday'
import * as StreamPerMonthModule from '../Charts/DetailedCharts/StreamPerMonth'
import * as HourlyStreamsModule from '../Charts/SimpleCharts/HourlyStreams'
import * as StreamPerDayOfWeekModule from '../Charts/DetailedCharts/StreamPerDayOfWeek'
import * as ArtistDiscoveryModule from '../Charts/DetailedCharts/ArtistDiscovery'
import * as TotalStreamsModule from '../Charts/DetailedCharts/TotalStreams'

function makeAnswer(intent: ChatAnswer['intent'], year?: number): ChatAnswer {
    return {
        intent,
        params: year !== undefined ? { year } : {},
        title: 'Test',
        explanation: 'Test',
    }
}

describe('ChatChartRouter', () => {
    beforeEach(() => {
        vi.spyOn(TopArtistsModule, 'TopArtists').mockReturnValue(
            <div data-testid="TopArtists" />
        )
        vi.spyOn(TopTracksModule, 'TopTracks').mockReturnValue(
            <div data-testid="TopTracks" />
        )
        vi.spyOn(TopAlbumsModule, 'TopAlbums').mockReturnValue(
            <div data-testid="TopAlbums" />
        )
        vi.spyOn(CalendarHeatmapModule, 'CalendarHeatmap').mockReturnValue(
            <div data-testid="CalendarHeatmap" />
        )
        vi.spyOn(SessionAnalysisModule, 'SessionAnalysis').mockReturnValue(
            <div data-testid="SessionAnalysis" />
        )
        vi.spyOn(ListeningRhythmModule, 'ListeningRhythm').mockReturnValue(
            <div data-testid="ListeningRhythm" />
        )
        vi.spyOn(SkipRateModule, 'SkipRate').mockReturnValue(
            <div data-testid="SkipRate" />
        )
        vi.spyOn(RegularityModule, 'Regularity').mockReturnValue(
            <div data-testid="Regularity" />
        )
        vi.spyOn(NewVsOldModule, 'NewVsOld').mockReturnValue(
            <div data-testid="NewVsOld" />
        )
        vi.spyOn(FavoriteWeekdayModule, 'FavoriteWeekday').mockReturnValue(
            <div data-testid="FavoriteWeekday" />
        )
        vi.spyOn(StreamPerMonthModule, 'StreamPerMonth').mockReturnValue(
            <div data-testid="StreamPerMonth" />
        )
        vi.spyOn(HourlyStreamsModule, 'HourlyStreams').mockReturnValue(
            <div data-testid="HourlyStreams" />
        )
        vi.spyOn(
            StreamPerDayOfWeekModule,
            'StreamPerDayOfWeek'
        ).mockReturnValue(<div data-testid="StreamPerDayOfWeek" />)
        vi.spyOn(ArtistDiscoveryModule, 'ArtistDiscovery').mockReturnValue(
            <div data-testid="ArtistDiscovery" />
        )
        vi.spyOn(TotalStreamsModule, 'TotalStreams').mockReturnValue(
            <div data-testid="TotalStreams" />
        )
    })

    it.each([
        ['top_artists', 'TopArtists'],
        ['top_tracks', 'TopTracks'],
        ['top_albums', 'TopAlbums'],
        ['calendar_heatmap', 'CalendarHeatmap'],
        ['session_analysis', 'SessionAnalysis'],
        ['listening_rhythm', 'ListeningRhythm'],
        ['skip_rate', 'SkipRate'],
        ['regularity', 'Regularity'],
        ['new_vs_old', 'NewVsOld'],
        ['favorite_weekday', 'FavoriteWeekday'],
        ['streams_per_month', 'StreamPerMonth'],
        ['streams_per_hour', 'HourlyStreams'],
        ['streams_per_day_of_week', 'StreamPerDayOfWeek'],
        ['artist_discovery', 'ArtistDiscovery'],
        ['total_streams', 'TotalStreams'],
    ] as const)('routes %s → %s', (intent, testId) => {
        render(
            <ChatChartRouter
                answer={makeAnswer(intent as ChatAnswer['intent'])}
            />
        )
        expect(screen.getByTestId(testId)).toBeDefined()
    })

    it('passes year param through to the component', () => {
        let capturedYear: number | undefined
        vi.spyOn(TopArtistsModule, 'TopArtists').mockImplementation(
            ({ year }) => {
                capturedYear = year
                return <div />
            }
        )
        render(<ChatChartRouter answer={makeAnswer('top_artists', 2022)} />)
        expect(capturedYear).toBe(2022)
    })

    it('renders CustomChart for custom intent with rows', () => {
        render(
            <ChatChartRouter
                answer={{
                    intent: 'custom',
                    params: {},
                    title: 'Custom result',
                    explanation: 'Something',
                    sql: 'SELECT 1',
                }}
                rows={[{ total: 42 }]}
            />
        )
        // CustomChart wraps a ChartCard with the given title
        expect(screen.getByText('Custom result')).toBeDefined()
    })
})
