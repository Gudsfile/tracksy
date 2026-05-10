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
import { CalendarHeatmap } from './SimpleCharts/CalendarHeatmap'
import { TopArtists } from './SimpleCharts/TopArtists'
import { TopAlbums } from './SimpleCharts/TopAlbums'
import { TopTracks } from './SimpleCharts/TopTracks'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import {
    type SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import { useState, useEffect } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

export function SimpleView() {
    const [year, setYear] = useState<number | undefined>(undefined)
    const [summarize, setSummarize] = useState<
        SummarizeDataQueryResult | undefined
    >()
    const debouncedYear = useDebouncedValue(year, 250)

    useEffect(() => {
        const initDataSummarize = async () => {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            const s = results[0]
            setSummarize(s)
            if (s) setYear(new Date(Number(s.max_datetime)).getFullYear())
        }
        initDataSummarize()
    }, [])

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
                        <ArtistLoyalty year={debouncedYear} />
                        <SkipRate year={debouncedYear} />
                        <RepeatBehavior year={debouncedYear} />
                        <PrincipalPlatform year={debouncedYear} />
                        <FavoriteWeekday year={debouncedYear} />
                    </div>
                </>
            )}
        </>
    )
}
