import type { ChatAnswer } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import { CustomChart } from './CustomChart'
import { renderIntentChart } from './intentCharts'

type ChatChartRouterProps = {
    answer: ChatAnswer
    rows?: DBRow[]
}

/**
 * Renders the chart for a chat answer. When the intent maps to a bespoke chart
 * and the executed rows fit its shape, that chart is rendered from those rows so
 * the chart, the displayed SQL and the narrative stay in sync. Otherwise the
 * generic CustomChart (metric/list/bar/line/table) is used.
 */
export function ChatChartRouter({ answer, rows }: ChatChartRouterProps) {
    const data = rows ?? []
    const rich = renderIntentChart(answer, data)
    return rich ?? <CustomChart title={answer.title} rows={data} />
}
