import { StreamPerMonth } from './LabCharts/StreamPerMonth'
import { TopStreak } from './LabCharts/TopStreak'
import { SummaryPerYear } from './LabCharts/SummaryPerYear'
import { TotalStreams } from './LabCharts/TotalStreams'
import { TopArtist } from './LabCharts/TopArtist'
import { YearSidebar } from '../YearSidebar/YearSidebar'
import { useState, useEffect, useCallback } from 'react'
import {
    summarizeQuery,
    type SummarizeDataQueryResult,
} from './Summarize/summarizeQuery'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'
import { TopTracks } from './LabCharts/TopTracks'
import { TopArtists } from './LabCharts/TopArtists'
import { TopAlbums } from './LabCharts/TopAlbums'
import { Streaks } from './LabCharts/Streaks'
import { Top10Evolution } from './LabCharts/Top10Evolution'
import { Top10AlbumsEvolution } from './LabCharts/Top10AlbumsEvolution'
import { Top10TracksEvolution } from './LabCharts/Top10TracksEvolution'
import { StreamPerDayOfWeek } from './LabCharts/StreamPerDayOfWeek'
import { ArtistDiscovery } from './LabCharts/ArtistDiscovery'
import { Top10Race } from './LabCharts/Top10Race'
import { Top10BillboardRace } from './LabCharts/Top10BillboardRace'
import { SessionAnalysis as SessionAnalysisDetailed } from './LabCharts/SessionAnalysis'

export function LabView() {
    const [year, setYear] = useState<number | undefined>(2006)
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

    const wipSection = (
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
            <Top10Race year={debouncedYear} />
            <Top10BillboardRace year={debouncedYear} />
            <SessionAnalysisDetailed year={debouncedYear} />
        </section>
    )

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <TopStreak />
                <TotalStreams />
                <TopArtist />
            </div>
            {summarize ? (
                <div className="flex flex-col gap-4 md:flex-row">
                    <YearSidebar
                        value={year}
                        onChange={setYear}
                        min={new Date(
                            Number(summarize.min_datetime)
                        ).getFullYear()}
                        max={new Date(
                            Number(summarize.max_datetime)
                        ).getFullYear()}
                    />
                    <div className="min-w-0 flex-1">
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
                        {wipSection}
                    </div>
            ) : (
                wipSection
            )}
        </>
    )
}
