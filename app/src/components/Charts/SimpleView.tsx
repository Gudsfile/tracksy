import { ConcentrationScore } from './SimpleCharts/ConcentrationScore'
import { ListeningRhythm } from './SimpleCharts/ListeningRhythm'
import { Regularity } from './SimpleCharts/Regularity'
import { SeasonalPatterns } from './SimpleCharts/SeasonalPatterns'
import { EvolutionOverTime } from './SimpleCharts/EvolutionOverTime'
import { NewVsOld } from './SimpleCharts/NewVsOld'
import { SkipRate } from './SimpleCharts/SkipRate'
import { RepeatBehavior } from './SimpleCharts/RepeatBehavior'
import { FunFacts } from './SimpleCharts/FunFacts'
import { PrincipalPlatform } from './SimpleCharts/PrincipalPlatform'
import { ArtistLoyalty } from './SimpleCharts/ArtistLoyalty'
import { FavoriteWeekday } from './SimpleCharts/FavoriteWeekday'
import { UnbeatableStreak } from './SimpleCharts/UnbeatableStreak'
import { CalendarHeatmap } from './SimpleCharts/CalendarHeatmap'
import { HourlyStreams } from './SimpleCharts/HourlyStreams'
import { SessionAnalysis } from './SimpleCharts/SessionAnalysis'
import { TopArtists } from './SimpleCharts/TopArtists'
import { TopAlbums } from './SimpleCharts/TopAlbums'
import { TopTracks } from './SimpleCharts/TopTracks'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import {
    type SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import { useState, useEffect, useCallback } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'

export function SimpleView() {
    const [year, setYear] = useState<number | undefined>(undefined)
    const [summarize, setSummarize] = useState<
        SummarizeDataQueryResult | undefined
    >()
    const debouncedYear = useDebouncedValue(year, 250)

    const initDataSummarize = useCallback(async () => {
        const results =
            await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
        setSummarize(results[0] || undefined)
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
                    <div className="sticky top-2 z-50">
                        <RangeSlider
                            value={year}
                            min={new Date(
                                Number(summarize.min_datetime)
                            ).getFullYear()}
                            max={new Date(
                                Number(summarize.max_datetime)
                            ).getFullYear()}
                            step={1}
                            onChange={setYear}
                        />
                    </div>

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
                    </div>
                </>
            )}
        </>
    )
}
