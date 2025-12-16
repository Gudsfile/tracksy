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
import { DiversityScore } from './SimpleCharts/DiversityScore'
import { FavoriteWeekday } from './SimpleCharts/FavoriteWeekday'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { SummarizeDataQueryResult, summarizeQuery } from './summarizeQuery'
import { useState, useEffect } from 'react'

export function SimpleView() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [minYear, setMinYear] = useState(2006)
    const [maxYear, setMaxYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const initDataSummarize = async () => {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            if (results.length === 0) return
            setMinYear(new Date(results[0].min_datetime).getFullYear() || 2006)
            setMaxYear(
                new Date(results[0].max_datetime).getFullYear() ||
                    new Date().getFullYear()
            )
        }
        initDataSummarize()
    }, [])

    return (
        <>
            <div className="mt-4">
                <FunFacts />
            </div>

            <RangeSlider
                value={year}
                min={minYear}
                max={maxYear}
                step={1}
                onChange={setYear}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ConcentrationScore year={year} />
                <DiversityScore year={year} />
                <ListeningRhythm year={year} />
                <Regularity year={year} />
                <div className="md:col-span-2">
                    <EvolutionOverTime year={year} />
                </div>
                <SeasonalPatterns year={year} />
                <NewVsOld year={year} />
                <SkipRate year={year} />
                <RepeatBehavior year={year} />
                <PrincipalPlatform year={year} />
                <FavoriteWeekday year={year} />
            </div>
        </>
    )
}
