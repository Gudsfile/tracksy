import { useCallback } from 'react'
import type { SessionAnalysisDetailedResult } from './query'
import { buildSessionAnalysisDetailedQuery } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface SessionAnalysisProps {
    year: number | undefined
}

export function SessionAnalysis({ year }: SessionAnalysisProps) {
    const plotBuilder = useCallback(
        (data: SessionAnalysisDetailedResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )

    return (
        <div>
            <p className="text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 -mb-2">
                How have my listening sessions evolved over time?
            </p>
            <Common<SessionAnalysisDetailedResult>
                query={buildSessionAnalysisDetailedQuery(year)}
                buildPlot={plotBuilder}
            />
        </div>
    )
}
