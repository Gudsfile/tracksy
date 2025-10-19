import { StreamPerMonth } from './StreamPerMonth'
import { StreamPerHour } from './StreamPerHour'
import { SummaryPerYear } from './SummaryPerYear'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { useState, useEffect } from 'react'
import { query, type SummarizeData } from './summarizeQuery'
import { queryDBAsJSON } from '../../db/queries/queryDB'

export function Charts() {
    const [year, setYear] = useState(2006) // Spotify was founded on April 23, 2006.
    const [summarize, setSummarize] = useState<SummarizeData | undefined>()

    useEffect(() => {
        const initDataSummarize = async () => {
            const results = await queryDBAsJSON<SummarizeData>(query)
            setSummarize(results[0] || undefined)
        }
        initDataSummarize()
    }, [])

    useEffect(() => {
        if (summarize) setYear(new Date(summarize.max_datetime).getFullYear())
    }, [summarize])

    return (
        <>
            {summarize && (
                <>
                    <RangeSlider
                        value={year}
                        onChange={setYear}
                        min={new Date(summarize.min_datetime).getFullYear()}
                        max={new Date(summarize.max_datetime).getFullYear()}
                        step={1}
                    />
                    <StreamPerMonth
                        year={year}
                        maxValue={summarize.max_monthly_duration}
                    />
                    <StreamPerHour
                        year={year}
                        maxValue={Number(summarize.max_count_hourly_stream)}
                    />
                    <SummaryPerYear year={year} />
                </>
            )}
        </>
    )
}
