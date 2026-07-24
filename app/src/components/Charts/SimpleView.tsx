import { ConcentrationScore as ConcentrationScoreRaw } from './SimpleCharts/ConcentrationScore'
import { ListeningRhythm as ListeningRhythmRaw } from './SimpleCharts/ListeningRhythm'
import { Regularity as RegularityRaw } from './SimpleCharts/Regularity'
import { SeasonalPatterns as SeasonalPatternsRaw } from './SimpleCharts/SeasonalPatterns'
import { EvolutionOverTime as EvolutionOverTimeRaw } from './SimpleCharts/EvolutionOverTime'
import { NewVsOld as NewVsOldRaw } from './SimpleCharts/NewVsOld'
import { SkipRate as SkipRateRaw } from './SimpleCharts/SkipRate'
import { RepeatBehavior as RepeatBehaviorRaw } from './SimpleCharts/RepeatBehavior'
import { FunFacts as FunFactsRaw } from './SimpleCharts/FunFacts'
import { PrincipalPlatform as PrincipalPlatformRaw } from './SimpleCharts/PrincipalPlatform'
import { ArtistLoyalty as ArtistLoyaltyRaw } from './SimpleCharts/ArtistLoyalty'
import { FavoriteWeekday as FavoriteWeekdayRaw } from './SimpleCharts/FavoriteWeekday'
import { UnbeatableStreak as UnbeatableStreakRaw } from './SimpleCharts/UnbeatableStreak'
import { BingeListener as BingeListenerRaw } from './SimpleCharts/BingeListener'
import { VarietyDay as VarietyDayRaw } from './SimpleCharts/VarietyDay'
import { CalendarHeatmap as CalendarHeatmapRaw } from './SimpleCharts/CalendarHeatmap'
import { HourlyStreams as HourlyStreamsRaw } from './SimpleCharts/HourlyStreams'
import { SessionAnalysis as SessionAnalysisRaw } from './SimpleCharts/SessionAnalysis'
import { TopArtists as TopArtistsRaw } from './SimpleCharts/TopArtists'
import { TopAlbums as TopAlbumsRaw } from './SimpleCharts/TopAlbums'
import { TopTracks as TopTracksRaw } from './SimpleCharts/TopTracks'
import { YearSidebar } from '../YearSidebar/YearSidebar'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import {
    type SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import { memo, useState, useEffect, useCallback } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'

const ConcentrationScore = memo(ConcentrationScoreRaw)
const ListeningRhythm = memo(ListeningRhythmRaw)
const Regularity = memo(RegularityRaw)
const SeasonalPatterns = memo(SeasonalPatternsRaw)
const EvolutionOverTime = memo(EvolutionOverTimeRaw)
const NewVsOld = memo(NewVsOldRaw)
const SkipRate = memo(SkipRateRaw)
const RepeatBehavior = memo(RepeatBehaviorRaw)
const FunFacts = memo(FunFactsRaw)
const PrincipalPlatform = memo(PrincipalPlatformRaw)
const ArtistLoyalty = memo(ArtistLoyaltyRaw)
const FavoriteWeekday = memo(FavoriteWeekdayRaw)
const UnbeatableStreak = memo(UnbeatableStreakRaw)
const BingeListener = memo(BingeListenerRaw)
const VarietyDay = memo(VarietyDayRaw)
const CalendarHeatmap = memo(CalendarHeatmapRaw)
const HourlyStreams = memo(HourlyStreamsRaw)
const SessionAnalysis = memo(SessionAnalysisRaw)
const TopArtists = memo(TopArtistsRaw)
const TopAlbums = memo(TopAlbumsRaw)
const TopTracks = memo(TopTracksRaw)

export function SimpleView() {
    const [year, setYear] = useState<number | undefined>(undefined)
    const [summarize, setSummarize] = useState<
        SummarizeDataQueryResult | undefined
    >()
    const debouncedYear = useDebouncedValue(year, 250)

    const initDataSummarize = useCallback(async () => {
        try {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            setSummarize(results[0] || undefined)
        } catch {
            // DB not ready yet (no data loaded), year stays at default
        }
    }, [])

    useEffect(() => {
        initDataSummarize()
    }, [initDataSummarize])

    useEffect(() => {
        window.addEventListener(DATA_LOADED_EVENT, initDataSummarize)
        return () =>
            window.removeEventListener(DATA_LOADED_EVENT, initDataSummarize)
    }, [initDataSummarize])

    useEffect(() => {
        if (summarize)
            setYear(new Date(Number(summarize.max_datetime)).getFullYear())
    }, [summarize])

    return (
        <>
            <div className="mt-4 mb-6">
                <FunFacts />
            </div>

            {summarize && (
                <>
                    <YearSidebar
                        value={year}
                        min={new Date(
                            Number(summarize.min_datetime)
                        ).getFullYear()}
                        max={new Date(
                            Number(summarize.max_datetime)
                        ).getFullYear()}
                        onChange={setYear}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <TopTracks year={debouncedYear} />
                        <TopArtists year={debouncedYear} />
                        <TopAlbums year={debouncedYear} />
                        <div className="md:col-span-3">
                            <CalendarHeatmap year={debouncedYear} />
                        </div>
                        <ConcentrationScore year={debouncedYear} />
                        <ListeningRhythm year={debouncedYear} />
                        <Regularity year={debouncedYear} />
                        <div className="md:col-span-2">
                            <EvolutionOverTime year={debouncedYear} />
                        </div>
                        <SeasonalPatterns year={debouncedYear} />
                        <NewVsOld year={debouncedYear} />
                        <div className="row-span-2">
                            <ArtistLoyalty year={debouncedYear} />
                        </div>
                        <SkipRate year={debouncedYear} />
                        <div className="row-span-2">
                            <SessionAnalysis year={debouncedYear} />
                        </div>
                        <RepeatBehavior year={debouncedYear} />
                        <div className="row-span-3 md:col-span-2">
                            <HourlyStreams year={debouncedYear} />
                        </div>
                        <PrincipalPlatform year={debouncedYear} />
                        <FavoriteWeekday year={debouncedYear} />
                        <UnbeatableStreak year={debouncedYear} />
                        <BingeListener year={debouncedYear} />
                        <VarietyDay year={debouncedYear} />
                    </div>
                </>
            )}
        </>
    )
}
