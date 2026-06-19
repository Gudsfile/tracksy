import type { ReactNode } from 'react'
import type { ChatAnswer } from '../../llm/types'
import type { IntentName } from '../../llm/intents'
import type { DBRow } from '../../llm/inferChartType'

import { TopArtists } from '../Charts/SimpleCharts/TopArtists/TopArtists'
import type { TopArtistsResult } from '../Charts/SimpleCharts/TopArtists/query'
import { TopTracks } from '../Charts/SimpleCharts/TopTracks/TopTracks'
import type { TopTracksResult } from '../Charts/SimpleCharts/TopTracks/query'
import { TopAlbums } from '../Charts/SimpleCharts/TopAlbums/TopAlbums'
import type { TopAlbumsResult } from '../Charts/SimpleCharts/TopAlbums/query'
import { EvolutionOverTime } from '../Charts/SimpleCharts/EvolutionOverTime/EvolutionOverTime'
import type { EvolutionResult } from '../Charts/SimpleCharts/EvolutionOverTime/query'
import { CalendarHeatmap } from '../Charts/SimpleCharts/CalendarHeatmap/CalendarHeatmap'
import type { CalendarHeatmapQueryResult } from '../Charts/SimpleCharts/CalendarHeatmap/query'
import { HourlyStreams } from '../Charts/SimpleCharts/HourlyStreams/HourlyStreams'
import type { HourlyStreamsQueryResult } from '../Charts/SimpleCharts/HourlyStreams/query'
import { SkipRate } from '../Charts/SimpleCharts/SkipRate/SkipRate'
import type { SkipRateResult } from '../Charts/SimpleCharts/SkipRate/query'
import { ListeningRhythm } from '../Charts/SimpleCharts/ListeningRhythm/ListeningRhythm'
import type { ListeningRhythmResult } from '../Charts/SimpleCharts/ListeningRhythm/query'
import { SeasonalPatterns } from '../Charts/SimpleCharts/SeasonalPatterns/SeasonalPatterns'
import type { SeasonalResult } from '../Charts/SimpleCharts/SeasonalPatterns/query'
import { FavoriteWeekday } from '../Charts/SimpleCharts/FavoriteWeekday/FavoriteWeekday'
import type { FavoriteWeekdayResult } from '../Charts/SimpleCharts/FavoriteWeekday/query'

type IntentChart = {
    /** Every key must be present in the executed rows for the rich chart to render. */
    columns: string[]
    /** Renders the bespoke View from the executed rows; may return null to defer to the fallback. */
    render: (rows: DBRow[], answer: ChatAnswer) => ReactNode
}

// Maps an intent to a bespoke chart, fed directly with the rows the answer's SQL
// already produced — so the chart, the displayed SQL and the narrative all read
// the same result set. Intents absent here (or whose rows lack the required
// columns) fall back to the generic CustomChart.
const REGISTRY: Partial<Record<IntentName, IntentChart>> = {
    top_artists: {
        columns: ['artist_name', 'count_streams', 'ms_played'],
        render: (rows) => (
            <TopArtists data={rows as unknown as TopArtistsResult[]} />
        ),
    },
    top_tracks: {
        columns: ['track_name', 'artist_name', 'count_streams', 'ms_played'],
        render: (rows) => (
            <TopTracks data={rows as unknown as TopTracksResult[]} />
        ),
    },
    top_albums: {
        columns: ['album_name', 'artist_name', 'count_streams', 'ms_played'],
        render: (rows) => (
            <TopAlbums data={rows as unknown as TopAlbumsResult[]} />
        ),
    },
    evolution_over_time: {
        columns: ['stream_year', 'stream_count', 'ms_played'],
        render: (rows, answer) =>
            answer.params.year === undefined ? null : (
                <EvolutionOverTime
                    data={rows as unknown as EvolutionResult[]}
                    year={answer.params.year}
                />
            ),
    },
    calendar_heatmap: {
        columns: ['stream_date', 'stream_count'],
        render: (rows, answer) =>
            answer.params.year === undefined ? null : (
                <CalendarHeatmap
                    data={rows as unknown as CalendarHeatmapQueryResult[]}
                    year={answer.params.year}
                />
            ),
    },
    streams_per_hour: {
        columns: ['play_hour', 'count_streams', 'ms_played'],
        render: (rows) => (
            <HourlyStreams
                data={rows as unknown as HourlyStreamsQueryResult[]}
            />
        ),
    },
    skip_rate: {
        columns: ['complete_listens', 'skipped_listens'],
        render: (rows) => (
            <SkipRate data={rows[0] as unknown as SkipRateResult} />
        ),
    },
    listening_rhythm: {
        columns: ['morning', 'afternoon', 'evening', 'night', 'total'],
        render: (rows) => (
            <ListeningRhythm
                data={rows[0] as unknown as ListeningRhythmResult}
            />
        ),
    },
    seasonal_patterns: {
        columns: ['winter', 'spring', 'summer', 'fall', 'total'],
        render: (rows) => (
            <SeasonalPatterns data={rows[0] as unknown as SeasonalResult} />
        ),
    },
    favorite_weekday: {
        columns: ['day_name', 'stream_count', 'ms_played', 'pct'],
        render: (rows) => (
            <FavoriteWeekday
                data={rows as unknown as FavoriteWeekdayResult[]}
            />
        ),
    },
}

function rowsHave(rows: DBRow[], columns: string[]): boolean {
    if (rows.length === 0) return false
    const keys = new Set(Object.keys(rows[0]))
    return columns.every((c) => keys.has(c))
}

/**
 * Renders the intent's bespoke chart from the already-executed SQL rows, or null
 * when the intent has no mapping or the rows don't contain the columns the chart
 * needs (the caller then falls back to the generic CustomChart/table).
 */
export function renderIntentChart(
    answer: ChatAnswer,
    rows: DBRow[]
): ReactNode {
    const entry = REGISTRY[answer.intent]
    if (!entry || !rowsHave(rows, entry.columns)) return null
    return entry.render(rows, answer)
}

/** Required columns per mapped intent — used to keep the prompt few-shots in sync. */
export const INTENT_CHART_COLUMNS: Partial<Record<IntentName, string[]>> =
    Object.fromEntries(
        Object.entries(REGISTRY).map(([intent, chart]) => [
            intent,
            chart.columns,
        ])
    )
