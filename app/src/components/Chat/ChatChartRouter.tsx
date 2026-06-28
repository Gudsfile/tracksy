import type { ChatAnswer } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import type { ChartConfig } from '../../llm/askChartConfig'
import { CustomChart } from './CustomChart'
import { renderIntentChart } from './intentCharts'

type ChatChartRouterProps = {
    answer: ChatAnswer
    rows?: DBRow[]
    chartConfig?: ChartConfig
}

/**
 * Renders the chart for a chat answer. Bespoke intent charts take priority;
 * when the intent has no mapping or the rows don't fit its required shape,
 * falls back to CustomChart using the ChartAgent config (or inferChartType
 * when the ChartAgent was not run, e.g. on mobile).
 */
export function ChatChartRouter({
    answer,
    rows,
    chartConfig,
}: ChatChartRouterProps) {
    const data = rows ?? []
    const rich = renderIntentChart(answer, data)
    return (
        rich ?? (
            <CustomChart
                title={answer.title}
                rows={data}
                chartConfig={chartConfig}
            />
        )
    )
}
