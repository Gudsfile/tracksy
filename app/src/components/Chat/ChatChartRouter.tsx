import type { ChatAnswer } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import type { ChartConfig } from '../../llm/askChartConfig'
import { GenericChartRenderer } from './GenericChartRenderer'

type ChatChartRouterProps = {
    answer: ChatAnswer
    rows?: DBRow[]
    chartConfig?: ChartConfig
}

/**
 * Renders the chart for a chat answer. The ChartAgent picks the config;
 * GenericChartRenderer handles all chart types using shared primitives.
 * When chartConfig is absent (mobile / agent error), inferConfig() falls back
 * to heuristic detection inside GenericChartRenderer.
 */
export function ChatChartRouter({
    answer,
    rows,
    chartConfig,
}: ChatChartRouterProps) {
    return (
        <GenericChartRenderer
            title={answer.title}
            rows={rows ?? []}
            chartConfig={chartConfig}
        />
    )
}
