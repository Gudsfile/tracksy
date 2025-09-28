import { StreamPerMonth } from './StreamPerMonth'
import { StreamPerHour } from './StreamPerHour'
import { SummaryPerYear } from './SummaryPerYear'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { useState, useEffect } from 'react'
import { query, SummarizeData } from './summarizeQuery'
import { StructRowProxy } from 'apache-arrow'
import { queryDB } from '../../db/queries/queryDB'

export function Charts() {
    const [year, setYear] = useState(2006) // Spotify was founded on April 23, 2006.
    const [summarize, setSummarize] = useState<
        StructRowProxy<SummarizeData> | undefined
    >()

    useEffect(() => {
        const initDataSummarize = async () => {
            const result = await queryDB<SummarizeData>(query)
            setSummarize(result?.get(0) || undefined)
        }
        initDataSummarize()
    }, [query])

    useEffect(() => {
        if (summarize)
            setYear(new Date(summarize.max_datetime as number).getFullYear())
    }, [summarize])

    return (
        <>
            {summarize && (
                <>
                    <RangeSlider
                        value={year}
                        onChange={setYear}
                        min={new Date(
                            summarize.min_datetime as number
                        ).getFullYear()}
                        max={new Date(
                            summarize.max_datetime as number
                        ).getFullYear()}
                        step={1}
                    />
                    <StreamPerMonth year={year} />
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
