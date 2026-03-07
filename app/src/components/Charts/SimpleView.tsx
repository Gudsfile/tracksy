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
import { TopArtists } from './SimpleCharts/TopArtists'
import { TopAlbums } from './SimpleCharts/TopAlbums'
import { TopTracks } from './SimpleCharts/TopTracks'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import {
    SummarizeDataQueryResult,
    summarizeQuery,
} from './Summarize/summarizeQuery'
import { useState, useEffect } from 'react'

export function SimpleView() {
    const [minYear, setMinYear] = useState(2006)
    const [maxYear, setMaxYear] = useState(new Date().getFullYear())
    const [range, setRange] = useState({
        start: 2006,
        end: new Date().getFullYear(),
    })

    useEffect(() => {
        const initDataSummarize = async () => {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            if (results.length === 0) return
            setMinYear(new Date(Number(results[0].min_datetime)).getFullYear())
            setMaxYear(new Date(Number(results[0].max_datetime)).getFullYear())
            setRange({
                start: new Date(Number(results[0].min_datetime)).getFullYear(),
                end: new Date(Number(results[0].max_datetime)).getFullYear(),
            })
        }
        initDataSummarize()
    }, [])

    return (
        <>
            <div className="mt-4 mb-6">
                <FunFacts />
            </div>

            <div className="sticky top-2 z-50">
                <RangeSlider
                    range={[range.start, range.end]}
                    min={minYear}
                    max={maxYear}
                    onRangeChange={setRange}
                    step={1}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TopTracks year={range.end} />
                <TopArtists year={range.end} />
                <TopAlbums year={range.end} />
                <ConcentrationScore year={range.end} />
                <ListeningRhythm year={range.end} />
                <Regularity year={range.end} />
                <div className="md:col-span-2">
                    <EvolutionOverTime year={range.end} />
                </div>
                <SeasonalPatterns year={range.end} />
                <NewVsOld year={range.end} />
                <ArtistLoyalty year={range.end} />
                <SkipRate year={range.end} />
                <RepeatBehavior year={range.end} />
                <PrincipalPlatform year={range.end} />
                <FavoriteWeekday year={range.end} />
            </div>
        </>
    )
}
