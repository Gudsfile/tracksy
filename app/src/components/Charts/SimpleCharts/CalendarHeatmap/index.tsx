import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    buildCalendarHeatmapQuery,
    type CalendarHeatmapQueryResult,
} from './query'
import { CalendarHeatmap as CalendarHeatmapView } from './CalendarHeatmap'

function CalendarHeatmapLoader({ year }: { year: number }) {
    const { data, isLoading } = useDBQueryMany<CalendarHeatmapQueryResult>({
        query: buildCalendarHeatmapQuery(year),
        year,
    })

    return <CalendarHeatmapView data={data} year={year} isLoading={isLoading} />
}

export function CalendarHeatmap({ year }: { year: number | undefined }) {
    if (year === undefined) {
        return <CalendarHeatmapView data={undefined} year={undefined} />
    }
    return <CalendarHeatmapLoader year={year} />
}
