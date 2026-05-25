import { it, vi, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { LabView } from './LabView'
import * as db from '../../db/queries/queryDB'
import {
    type SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import {
    type StreamTimelineQueryResult,
    queryStreamTimeline,
} from './LabCharts/StreamTimeline/query'
import {
    type SummaryPerYearQueryResult,
    summarizePerYearQuery,
} from './LabCharts/SummaryPerYear/query'
import {
    type Top10EvolutionQueryResult,
    queryTop10Evolution,
} from './LabCharts/Top10Evolution/query'
import {
    type Top10RaceQueryResult,
    queryTop10Race,
} from './LabCharts/Top10Race/query'
import {
    type StreamPerDayOfWeekQueryResult,
    streamPerDayOfWeekQueryByYear,
} from './LabCharts/StreamPerDayOfWeek/query'
import {
    type ArtistDiscoveryQueryResult,
    queryArtistDiscovery,
} from './LabCharts/ArtistDiscovery/query'
import {
    type Top10AlbumsEvolutionQueryResult,
    queryTop10AlbumsEvolution,
} from './LabCharts/Top10AlbumsEvolution/query'
import {
    type StreamVarietyQueryResult,
    type StreamVarietyStatsQueryResult,
    queryStreamVariety,
    queryStreamVarietyStats,
} from './LabCharts/StreamVariety/query'
import {
    type Top10TracksEvolutionQueryResult,
    queryTop10TracksEvolution,
} from './LabCharts/Top10TracksEvolution/query'
import {
    type StreamDiscoveryQueryResult,
    type StreamDiscoveryStatsQueryResult,
    queryStreamDiscovery,
    queryStreamDiscoveryStats,
} from './LabCharts/StreamDiscovery/query'

const summarizedDataMock: SummarizeDataQueryResult[] = [
    {
        max_datetime: '1734134400000',
        min_datetime: '1704067200000',
    },
]

const streamTimelineResultMock: StreamTimelineQueryResult[] = [
    { ts: '2024-01-01', ms_played: 35379985, count_streams: 98 },
    { ts: '2024-02-01', ms_played: 37831018, count_streams: 103 },
    { ts: '2024-03-01', ms_played: 39959692, count_streams: 109 },
    { ts: '2024-04-01', ms_played: 30708911, count_streams: 85 },
    { ts: '2024-05-01', ms_played: 29345960, count_streams: 95 },
    { ts: '2024-06-01', ms_played: 31586380, count_streams: 90 },
    { ts: '2024-07-01', ms_played: 31898499, count_streams: 94 },
    { ts: '2024-08-01', ms_played: 33018297, count_streams: 97 },
    { ts: '2024-09-01', ms_played: 34084620, count_streams: 95 },
    { ts: '2024-10-01', ms_played: 37579102, count_streams: 100 },
    { ts: '2024-11-01', ms_played: 35533272, count_streams: 96 },
    { ts: '2024-12-01', ms_played: 17777800, count_streams: 48 },
]

const summaryPerYearResultMock: SummaryPerYearQueryResult[] = [
    {
        year: 2024,
        type: 'count_new_tracks_played',
        count_streams: 485,
    },
    {
        year: 2024,
        type: 'count_unique_track_played',
        count_streams: 0,
    },
    {
        year: 2024,
        type: 'count_other_tracks_played',
        count_streams: 625,
    },
]

const top10EvolutionResultMock: Top10EvolutionQueryResult[] = [
    {
        year: 2024,
        artist: 'Richard Snyder',
        rank: 1,
        play_count: 100,
    },
]

const top10RaceResultMock: Top10RaceQueryResult[] = [
    {
        stream_date_ts: 1704067200000,
        entity_name: 'Richard Snyder',
        play_count: 100,
    },
]

const top10AlbumsEvolutionResultMock: Top10AlbumsEvolutionQueryResult[] = [
    {
        year: 2024,
        album: 'Richard Redyns',
        artist: 'Richard Snyder',
        rank: 1,
        play_count: 100,
    },
]

const streamVarietyResultMock: StreamVarietyQueryResult[] = [
    { ts: '2024-01-01', distinct_count: 2, repeat_count: 1, total_count: 3 },
]

const streamVarietyStatsMock: StreamVarietyStatsQueryResult[] = [
    { total_distinct: 2, total_repeat: 1, total_streams: 3 },
]

const streamDiscoveryResultMock: StreamDiscoveryQueryResult[] = [
    { ts: '2024-01-01', new_count: 1, known_count: 1, total_count: 2 },
]

const streamDiscoveryStatsMock: StreamDiscoveryStatsQueryResult[] = [
    { total_new: 1, total_known: 1, total_distinct: 2 },
]

const top10TracksEvolutionResultMock: Top10TracksEvolutionQueryResult[] = [
    {
        year: 2024,
        track: 'Richard Redyns',
        artist: 'Richard Snyder',
        rank: 1,
        play_count: 100,
    },
]

const streamPerDayOfWeekResultMock: StreamPerDayOfWeekQueryResult[] = [
    {
        dayOfWeek: 1,
        hour: 12,
        count_streams: 10,
    },
]

const artistDiscoveryResultMock: ArtistDiscoveryQueryResult[] = [
    {
        year: 2023,
        new_artists: 50,
        cumulative_artists: 50,
        avg_listens_per_artist: 25.5,
    },
    {
        year: 2024,
        new_artists: 30,
        cumulative_artists: 80,
        avg_listens_per_artist: 18.3,
    },
]

it('renders all Charts', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vi.spyOn(db, 'queryDBAsJSON').mockImplementation((query) => {
        if (query === summarizeQuery) return Promise.resolve(summarizedDataMock)
        if (query === queryStreamTimeline(2024, 'month'))
            return Promise.resolve(streamTimelineResultMock)
        if (query === queryStreamVariety(2024, 'month', 'tracks'))
            return Promise.resolve(streamVarietyResultMock)
        if (query === queryStreamVarietyStats(2024, 'tracks'))
            return Promise.resolve(streamVarietyStatsMock)
        if (query === queryStreamDiscovery(2024, 'month', 'tracks'))
            return Promise.resolve(streamDiscoveryResultMock)
        if (query === queryStreamDiscoveryStats(2024, 'tracks'))
            return Promise.resolve(streamDiscoveryStatsMock)
        if (query === summarizePerYearQuery(2024))
            return Promise.resolve(summaryPerYearResultMock)
        if (query === queryArtistDiscovery())
            return Promise.resolve(artistDiscoveryResultMock)
        if (query === queryTop10Evolution())
            return Promise.resolve(top10EvolutionResultMock)
        if (query === queryTop10Race(2024) || query === queryTop10Race(2006))
            return Promise.resolve(top10RaceResultMock)
        if (query === queryTop10AlbumsEvolution())
            return Promise.resolve(top10AlbumsEvolutionResultMock)
        if (query === queryTop10TracksEvolution())
            return Promise.resolve(top10TracksEvolutionResultMock)
        if (query === streamPerDayOfWeekQueryByYear(2024))
            return Promise.resolve(streamPerDayOfWeekResultMock)
        return Promise.resolve([])
    })

    render(<LabView />)

    // Year sidebar
    const yearNav = await screen.findByRole('navigation', {
        name: 'Filter by year',
    })

    await waitFor(() => {
        expect(
            within(yearNav)
                .getByRole('button', { name: '2024' })
                .getAttribute('aria-pressed')
        ).toBe('true')
    })

    await screen.findByRole('heading', { name: /Stream Timeline/ })
    await screen.findByRole('heading', { name: 'Distribution of streams' })
    await screen.findByRole('heading', {
        name: 'Global Top 10 Artists Evolution',
    })
    await screen.findByRole('heading', { name: /Top 10 Race/ })
    await screen.findByRole('heading', {
        name: 'Stream per hour and day of week',
    })
})
