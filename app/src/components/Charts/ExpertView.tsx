import { StreamPerMonth } from './ExpertCharts/StreamPerMonth'
import { StreamPerHour } from './ExpertCharts/StreamPerHour'
import { TopStreak } from './ExpertCharts/TopStreak'
import { SummaryPerYear } from './ExpertCharts/SummaryPerYear'
import { TotalStreams } from './ExpertCharts/TotalStreams'
import { TopArtist } from './ExpertCharts/TopArtist'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { useState, useEffect } from 'react'
import { summarizeQuery, type SummarizeDataQueryResult } from './summarizeQuery'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { TopTracks } from './ExpertCharts/TopTracks'
import { TopArtists } from './ExpertCharts/TopArtists'
import { Streaks } from './ExpertCharts/Streaks'
import { Top10Evolution } from './ExpertCharts/Top10Evolution'
import { StreamPerDayOfWeek } from './ExpertCharts/StreamPerDayOfWeek'

export function ExpertView() {
    const [year, setYear] = useState(2006) // Spotify was founded on April 23, 2006.
    const [summarize, setSummarize] = useState<
        SummarizeDataQueryResult | undefined
    >()

    useEffect(() => {
        const initDataSummarize = async () => {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            setSummarize(results[0] || undefined)
        }
        initDataSummarize()
    }, [])

    useEffect(() => {
        if (summarize)
            setYear(new Date(Number(summarize.max_datetime)).getFullYear())
    }, [summarize])

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <TopStreak />
                <TotalStreams />
                <TopArtist />
            </div>
            {summarize && (
                <>
                    <RangeSlider
                        value={year}
                        onChange={setYear}
                        min={new Date(
                            Number(summarize.min_datetime)
                        ).getFullYear()}
                        max={new Date(
                            Number(summarize.max_datetime)
                        ).getFullYear()}
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
                    <TopTracks year={year} />
                    <TopArtists year={year} />
                </>
            )}

            <section className="p-6 mt-12 border rounded-2xl border border-gray-300/60 dark:border-slate-700/50 shadow-lg">
                <div className="relative mb-12">
                    <div className="border-t border-gray-300"></div>
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 py-1 text-sm font-medium rounded-full border">
                        🚧 Work in Progress
                    </span>
                </div>
                <p className="mb-4 text-gray-900 dark:text-gray-100">
                    Experimental section: the graphs below are currently under
                    development and may contain errors.
                </p>

                <Streaks />
                <Top10Evolution />
                <StreamPerDayOfWeek year={year} />
            </section>
        </>
    )
}
