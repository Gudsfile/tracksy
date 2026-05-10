import { StreamPerMonth } from './DetailedCharts/StreamPerMonth'
import { TopStreak } from './DetailedCharts/TopStreak'
import { SummaryPerYear } from './DetailedCharts/SummaryPerYear'
import { TotalStreams } from './DetailedCharts/TotalStreams'
import { TopArtist } from './DetailedCharts/TopArtist'
import { RangeSlider } from '../RangeSlider/RangeSlider'
import { useState, useEffect, useCallback } from 'react'
import {
    summarizeQuery,
    type SummarizeDataQueryResult,
} from './Summarize/summarizeQuery'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'
import { TopTracks } from './DetailedCharts/TopTracks'
import { TopArtists } from './DetailedCharts/TopArtists'
import { TopAlbums } from './DetailedCharts/TopAlbums'
import { Streaks } from './DetailedCharts/Streaks'
import { Top10Evolution } from './DetailedCharts/Top10Evolution'
import { Top10AlbumsEvolution } from './DetailedCharts/Top10AlbumsEvolution'
import { Top10TracksEvolution } from './DetailedCharts/Top10TracksEvolution'
import { StreamPerDayOfWeek } from './DetailedCharts/StreamPerDayOfWeek'
import { ArtistDiscovery } from './DetailedCharts/ArtistDiscovery'
import { SessionAnalysis as SessionAnalysisDetailed } from './DetailedCharts/SessionAnalysis'
import { DuckDBShell } from '../DuckDBShell/DuckDBShell'

export function DetailedView() {
    const [year, setYear] = useState<number | undefined>(2006)
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
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <TopStreak />
                <TotalStreams />
                <TopArtist />
            </div>
            {summarize && (
                <>
                    <div className="sticky top-2 z-50">
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
                    </div>
                    <StreamPerMonth
                        year={debouncedYear}
                        maxValue={summarize.max_monthly_duration}
                    />
                    <SummaryPerYear year={debouncedYear} />
                    <TopTracks year={debouncedYear} />
                    <TopArtists year={debouncedYear} />
                    <TopAlbums year={debouncedYear} />
                    <ArtistDiscovery />
                    <StreamPerDayOfWeek year={debouncedYear} />
                    <Top10AlbumsEvolution />
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
                <Top10TracksEvolution />
                <SessionAnalysisDetailed year={debouncedYear} />
            </section>
            <DuckDBShell />
        </>
    )
}
