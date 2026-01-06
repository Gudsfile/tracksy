import {
    SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import { it, vi, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SimpleView } from './SimpleView'
import * as db from '../../db/queries/queryDB'
import {
    type ConcentrationResult,
    queryConcentrationScore,
} from './SimpleCharts/ConcentrationScore/query'
import {
    type DiversityResult,
    queryDiversityScore,
} from './SimpleCharts/DiversityScore/query'
import {
    type ListeningRhythmResult,
    queryListeningRhythm,
} from './SimpleCharts/ListeningRhythm/query'
import {
    type RegularityResult,
    queryRegularity,
} from './SimpleCharts/Regularity/query'
import {
    type EvolutionResult,
    queryEvolutionOverTime,
} from './SimpleCharts/EvolutionOverTime/query'
import {
    type SeasonalResult,
    querySeasonalPatterns,
} from './SimpleCharts/SeasonalPatterns/query'
import {
    type NewVsOldResult,
    queryNewVsOld,
} from './SimpleCharts/NewVsOld/query'
import {
    type SkipRateResult,
    querySkipRate,
} from './SimpleCharts/SkipRate/query'
import {
    type RepeatResult,
    queryRepeatBehavior,
} from './SimpleCharts/RepeatBehavior/query'
import {
    type PlatformResult,
    queryPrincipalPlatform,
} from './SimpleCharts/PrincipalPlatform/query'
import {
    type FavoriteWeekdayResult,
    queryFavoriteWeekday,
} from './SimpleCharts/FavoriteWeekday/query'

const summarizedDataMock: SummarizeDataQueryResult[] = [
    {
        max_count_hourly_stream: 1234,
        max_datetime: '1734134400000',
        max_monthly_duration: 39959692,
        min_datetime: '1577836800000',
    },
]

const concentrationMock: ConcentrationResult[] = [
    {
        top5_pct: 1,
        top10_pct: 10,
        top20_pct: 25,
    },
]

const diversityMock: DiversityResult[] = [
    {
        unique_artists: 10,
        total_streams: 100,
        avg_streams_per_artist: 10,
    },
]

const listeningRhythmMock: ListeningRhythmResult[] = [
    {
        morning: 1,
        afternoon: 10,
        evening: 25,
        night: 50,
        total: 100,
    },
]

const regularityMock: RegularityResult[] = [
    {
        days_with_streams: 1,
        total_days: 10,
        longest_pause_days: 25,
    },
]

const evolutionOverTimeMock: EvolutionResult[] = [
    {
        year: 2024,
        streams: 100,
        ms_played: 1000,
    },
]

const seasonalPatternsMock: SeasonalResult[] = [
    {
        winter: 1,
        spring: 10,
        summer: 25,
        fall: 50,
        total: 86,
    },
]

const newVsOldMock: NewVsOldResult[] = [
    {
        new_artists_streams: 1,
        old_artists_streams: 10,
        new_artists_count: 25,
        total: 86,
    },
]

const skipRateMock: SkipRateResult[] = [
    {
        complete_listens: 1,
        skipped_listens: 10,
    },
]

const repeatBehaviorMock: RepeatResult[] = [
    {
        total_repeat_sequences: 1,
        max_consecutive: 10,
        most_repeated_track: 'track',
        avg_repeat_length: 25,
    },
]

const principalPlatformMock: PlatformResult[] = [
    {
        platform: 'platform',
        stream_count: 1,
        pct: 10,
    },
]

const favoriteWeekdayMock: FavoriteWeekdayResult[] = [
    {
        day_name: 'day',
        stream_count: 1,
        pct: 10,
    },
]

it('renders all SimpleView', async () => {
    vi.spyOn(db, 'queryDBAsJSON').mockImplementation((query) => {
        if (query === summarizeQuery) return Promise.resolve(summarizedDataMock)
        if (query === queryConcentrationScore(2024))
            return Promise.resolve(concentrationMock)
        if (query === queryDiversityScore(2024))
            return Promise.resolve(diversityMock)
        if (query === queryListeningRhythm(2024))
            return Promise.resolve(listeningRhythmMock)
        if (query === queryRegularity(2024))
            return Promise.resolve(regularityMock)
        if (query === queryEvolutionOverTime())
            return Promise.resolve(evolutionOverTimeMock)
        if (query === querySeasonalPatterns(2024))
            return Promise.resolve(seasonalPatternsMock)
        if (query === queryNewVsOld(2024)) return Promise.resolve(newVsOldMock)
        if (query === querySkipRate(2024)) return Promise.resolve(skipRateMock)
        if (query === queryRepeatBehavior(2024))
            return Promise.resolve(repeatBehaviorMock)
        if (query === queryPrincipalPlatform(2024))
            return Promise.resolve(principalPlatformMock)
        if (query === queryFavoriteWeekday(2024))
            return Promise.resolve(favoriteWeekdayMock)
        else return Promise.resolve([])
    })

    render(<SimpleView />)

    //range slider
    const slider = (await screen.findByRole('slider')) as HTMLInputElement

    await waitFor(() => {
        expect(slider.getAttribute('min')).toBe('2020')
        expect(slider.getAttribute('max')).toBe('2024')
        expect(slider.getAttribute('value')).toBe('2024')
    })

    // TODO: test funfact rendering
    await screen.findByRole('heading', { name: '📊 Concentration Score' })
    await screen.findByRole('heading', { name: '🎨 Loyalty vs Discovery' })
    await screen.findByRole('heading', { name: '⏰ Listening Rhythm' })
    await screen.findByRole('heading', { name: '📅 Listening Regularity' })
    await screen.findByRole('heading', { name: '📈 Evolution' })
    await screen.findByRole('heading', { name: '🌺 Seasonal patterns' })
    await screen.findByRole('heading', { name: '🆕 New vs Old' })
    await screen.findByRole('heading', { name: '⏭️ Listening Patience' })
    await screen.findByRole('heading', { name: '🔁 Repeat Behavior' })
    await screen.findByRole('heading', { name: '📱 Listening Devices' })
    await screen.findByRole('heading', { name: '📅 Favorite Weekday' })
})
