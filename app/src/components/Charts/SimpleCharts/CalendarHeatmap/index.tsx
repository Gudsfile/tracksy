import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    buildCalendarHeatmapQuery,
    type CalendarHeatmapQueryResult,
} from './query'
import { CalendarHeatmap as CalendarHeatmapView } from './CalendarHeatmap'

export function CalendarHeatmap({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<CalendarHeatmapQueryResult>({
        query: buildCalendarHeatmapQuery(year),
        year,
    })

    if (year === undefined) {
        return <CalendarHeatmapView data={undefined} year={undefined} />
    }
    if (!isLoading && !data) return null
    return <CalendarHeatmapView data={data} year={year} isLoading={isLoading} />
}
