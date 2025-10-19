import { StreamPerMonth } from './StreamPerMonth'
import { StreamPerHour } from './StreamPerHour'
import { TopStreak } from './TopStreak'
import { SummaryPerYear } from './SummaryPerYear'
import { TotalStreams } from './TotalStreams'
import { TopArtist } from './TopArtist'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { useState, useEffect } from 'react'
import { query, type SummarizeData } from './summarizeQuery'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { TopTracks } from './TopTracks'
import { TopArtists } from './TopArtists'
import { Streaks } from './Streaks'
import { Top10Evolution } from './Top10Evolution'

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
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <TopStreak />
                <TotalStreams />
                <TopArtist />
            </div>
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
                    <TopTracks year={year} />
                    <TopArtists year={year} />
                </>
            )}

            <section className="backdrop-blur-lg border border-white/30 shadow-lg p-6 rounded-2xl mt-12 ">
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
            </section>
        </>
    )
}
