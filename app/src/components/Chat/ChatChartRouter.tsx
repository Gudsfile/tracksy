import type { SummarizeDataQueryResult } from '../Charts/Summarize/summarizeQuery'
import type { ChatAnswer } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'

import { TopArtists } from '../Charts/SimpleCharts/TopArtists'
import { TopTracks } from '../Charts/SimpleCharts/TopTracks'
import { TopAlbums } from '../Charts/SimpleCharts/TopAlbums'
import { CalendarHeatmap } from '../Charts/SimpleCharts/CalendarHeatmap'
import { SessionAnalysis } from '../Charts/SimpleCharts/SessionAnalysis'
import { ListeningRhythm } from '../Charts/SimpleCharts/ListeningRhythm'
import { SkipRate } from '../Charts/SimpleCharts/SkipRate'
import { Regularity } from '../Charts/SimpleCharts/Regularity'
import { NewVsOld } from '../Charts/SimpleCharts/NewVsOld'
import { FavoriteWeekday } from '../Charts/SimpleCharts/FavoriteWeekday'
import { ConcentrationScore } from '../Charts/SimpleCharts/ConcentrationScore'
import { EvolutionOverTime } from '../Charts/SimpleCharts/EvolutionOverTime'
import { PrincipalPlatform } from '../Charts/SimpleCharts/PrincipalPlatform'
import { RepeatBehavior } from '../Charts/SimpleCharts/RepeatBehavior'
import { SeasonalPatterns } from '../Charts/SimpleCharts/SeasonalPatterns'
import { StreamPerMonth } from '../Charts/DetailedCharts/StreamPerMonth'
import { HourlyStreams } from '../Charts/SimpleCharts/HourlyStreams'
import { StreamPerDayOfWeek } from '../Charts/DetailedCharts/StreamPerDayOfWeek'
import { ArtistDiscovery } from '../Charts/DetailedCharts/ArtistDiscovery'
import { TotalStreams } from '../Charts/DetailedCharts/TotalStreams'
import { TopStreak } from '../Charts/DetailedCharts/TopStreak'
import { CustomChart } from './CustomChart'

type ChatChartRouterProps = {
    answer: ChatAnswer
    rows?: DBRow[]
    summarize?: SummarizeDataQueryResult
}

export function ChatChartRouter({
    answer,
    rows,
    summarize,
}: ChatChartRouterProps) {
    const year = answer.params.year

    switch (answer.intent) {
        case 'top_artists':
            return <TopArtists year={year} />
        case 'top_tracks':
            return <TopTracks year={year} />
        case 'top_albums':
            return <TopAlbums year={year} />
        case 'streams_per_month':
            return (
                <StreamPerMonth
                    year={year}
                    maxValue={summarize?.max_monthly_duration ?? 0}
                />
            )
        case 'streams_per_hour':
            return <HourlyStreams year={year} />
        case 'streams_per_day_of_week':
            return <StreamPerDayOfWeek year={year} />
        case 'calendar_heatmap':
            return <CalendarHeatmap year={year} />
        case 'session_analysis':
            return <SessionAnalysis year={year} />
        case 'artist_discovery':
            return <ArtistDiscovery />
        case 'listening_rhythm':
            return <ListeningRhythm year={year} />
        case 'skip_rate':
            return <SkipRate year={year} />
        case 'regularity':
            return <Regularity year={year} />
        case 'new_vs_old':
            return <NewVsOld year={year} />
        case 'favorite_weekday':
            return <FavoriteWeekday year={year} />
        case 'total_streams':
            return <TotalStreams />
        case 'concentration_score':
            return <ConcentrationScore year={year} />
        case 'evolution_over_time':
            return <EvolutionOverTime year={year} />
        case 'principal_platform':
            return <PrincipalPlatform year={year} />
        case 'repeat_behavior':
            return <RepeatBehavior year={year} />
        case 'top_streak':
            return <TopStreak />
        case 'seasonal_patterns':
            return <SeasonalPatterns year={year} />
        case 'custom':
            return <CustomChart title={answer.title} rows={rows ?? []} />
        default:
            return null
    }
}
