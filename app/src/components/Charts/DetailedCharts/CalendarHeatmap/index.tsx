import { useCallback } from 'react'
import type { CalendarHeatmapQueryResult } from './query'
import { buildCalendarHeatmapQuery } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface CalendarHeatmapProps {
    year: number | undefined
}

export function CalendarHeatmap({ year }: CalendarHeatmapProps) {
    const plotBuilder = useCallback(
        (data: CalendarHeatmapQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, year, isDark),
        [year]
    )

    return (
        <div>
            <p className="text-xs italic text-gray-400 dark:text-gray-500 px-6 pt-4 -mb-2">
                Which days of the year did I listen the most?
            </p>
            <Common<CalendarHeatmapQueryResult>
                query={buildCalendarHeatmapQuery(year)}
                buildPlot={plotBuilder}
            />
        </div>
    )
}
