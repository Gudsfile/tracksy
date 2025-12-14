import { it, vi, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ExpertView } from './ExpertView'
import * as db from '../../db/queries/queryDB'
import { type SummarizeDataQueryResult, summarizeQuery } from './summarizeQuery'
import {
    type StreamPerMonthQueryResult,
    queryStreamsPerMonthByYear,
} from './StreamPerMonth/query'
import {
    type StreamPerHourQueryResult,
    queryStreamsPerHoursByYear,
} from './StreamPerHour/query'
import {
    type SummaryPerYearQueryResult,
    summarizePerYearQuery,
} from './SummaryPerYear/query'

import {
    type TopTracksQueryResult,
    queryTopTracksByYear,
} from './TopTracks/query'

import {
    type TopArtistsQueryResult,
    queryTopArtistsByYear,
} from './TopArtists/query'

import {
    type Top10EvolutionQueryResult,
    queryTop10Evolution,
} from './Top10Evolution/query'

import {
    type StreamPerDayOfWeekQueryResult,
    streamPerDayOfWeekQueryByYear,
} from './StreamPerDayOfWeek/query'

const summarizedDataMock: SummarizeDataQueryResult[] = [
    {
        max_count_hourly_stream: 1234,
        max_datetime: '1734134400000',
        max_monthly_duration: 39959692,
        min_datetime: '1704067200000',
    },
]

const streamPerMonthResultMock: StreamPerMonthQueryResult[] = [
    {
        ts: 1704067200000,
        ms_played: 35379985,
        count_streams: 98,
    },
    {
        ts: 1706745600000,
        ms_played: 37831018,
        count_streams: 103,
    },
    {
        ts: 1709251200000,
        ms_played: 39959692,
        count_streams: 109,
    },
    {
        ts: 1711929600000,
        ms_played: 30708911,
        count_streams: 85,
    },
    {
        ts: 1714521600000,
        ms_played: 29345960,
        count_streams: 95,
    },
    {
        ts: 1717200000000,
        ms_played: 31586380,
        count_streams: 90,
    },
    {
        ts: 1719792000000,
        ms_played: 31898499,
        count_streams: 94,
    },
    {
        ts: 1722470400000,
        ms_played: 33018297,
        count_streams: 97,
    },
    {
        ts: 1725148800000,
        ms_played: 34084620,
        count_streams: 95,
    },
    {
        ts: 1727740800000,
        ms_played: 37579102,
        count_streams: 100,
    },
    {
        ts: 1730419200000,
        ms_played: 35533272,
        count_streams: 96,
    },
    {
        ts: 1733011200000,
        ms_played: 17777800,
        count_streams: 48,
    },
]

const streamPerHourResultMock: StreamPerHourQueryResult[] = [
    {
        hour: 0,
        count_streams: 1110,
        ms_played: 394703536,
    },
    {
        hour: 1,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 2,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 3,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 4,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 5,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 6,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 7,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 8,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 9,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 10,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 11,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 12,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 13,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 14,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 15,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 16,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 17,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 18,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 19,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 20,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 21,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 22,
        count_streams: 0,
        ms_played: 0,
    },
    {
        hour: 23,
        count_streams: 0,
        ms_played: 0,
    },
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

const topTracksResultMock: TopTracksQueryResult[] = [
    {
        track_name: 'Ice Cream for Crow',
        artist_name: 'Richard Snyder',
        count_streams: 23n,
        ms_played: BigInt(8557410),
    },
    {
        track_name: 'In The Past',
        artist_name: 'Tiffany Mitchell',
        count_streams: 25n,
        ms_played: BigInt(10607278),
    },
]

const topArtistsResultMock: TopArtistsQueryResult[] = [
    {
        artist_name: 'Rachel Johnson',
        count_streams: 27n,
        ms_played: BigInt(9926243),
    },
    {
        artist_name: 'Tiffany Mitchell',
        count_streams: 25n,
        ms_played: BigInt(10607278),
    },
    {
        artist_name: 'Richard Snyder',
        count_streams: 27n,
        ms_played: BigInt(9926243),
    },
    {
        artist_name: 'Ruben Wheeler',
        count_streams: 25n,
        ms_played: BigInt(10607278),
    },
    {
        artist_name: 'Brenda Tucker',
        count_streams: 23n,
        ms_played: BigInt(8557410),
    },
    {
        artist_name: 'Robert Hill',
        count_streams: 19n,
        ms_played: BigInt(4125663),
    },
    {
        artist_name: 'Leslie Wright',
        count_streams: 19n,
        ms_played: BigInt(7299586),
    },
    {
        artist_name: 'Erica Gentry',
        count_streams: 19n,
        ms_played: BigInt(8076933),
    },
    {
        artist_name: 'Cameron Carson',
        count_streams: 18n,
        ms_played: BigInt(7122097),
    },
    {
        artist_name: 'Dr. Stephanie Hill',
        count_streams: 17n,
        ms_played: BigInt(6505425),
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

const streamPerDayOfWeekResultMock: StreamPerDayOfWeekQueryResult[] = [
    {
        dayOfWeek: 1,
        hour: 12,
        count_streams: 10,
    },
]

it('renders all Charts', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    vi.spyOn(db, 'queryDBAsJSON').mockImplementation((query) => {
        if (query === summarizeQuery) return Promise.resolve(summarizedDataMock)
        if (query === queryStreamsPerMonthByYear(2024))
            return Promise.resolve(streamPerMonthResultMock)
        if (query === queryStreamsPerHoursByYear(2024))
            return Promise.resolve(streamPerHourResultMock)
        if (query === summarizePerYearQuery(2024))
            return Promise.resolve(summaryPerYearResultMock)
        if (query === queryTopTracksByYear(2024))
            return Promise.resolve(topTracksResultMock)
        if (query === queryTopArtistsByYear(2024))
            return Promise.resolve(topArtistsResultMock)
        if (query === queryTop10Evolution())
            return Promise.resolve(top10EvolutionResultMock)
        if (query === streamPerDayOfWeekQueryByYear(2024))
            return Promise.resolve(streamPerDayOfWeekResultMock)
    })

    render(<ExpertView />)

    //range slider
    const slider = await screen.findByRole('slider')

    await waitFor(() => {
        expect(slider.getAttribute('value')).toEqual('2024')
    })

    await screen.findByRole('heading', { name: 'Stream duration per month' })
    await screen.findByRole('heading', { name: 'Number of streams per hour' })
    await screen.findByRole('heading', { name: 'Distribution of streams' })
    await screen.findByRole('heading', { name: 'Top Tracks' })
    await screen.findByRole('heading', { name: 'Top Artists' })
    await screen.findByRole('heading', {
        name: 'Global Top 10 Artists Evolution',
    })
    await screen.findByRole('heading', {
        name: 'Stream per hour and day of week',
    })
})
