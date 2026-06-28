import type { AssistantPayload, ChatMessage } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import type { ChartConfig } from '../../llm/askChartConfig'
import { ChatChartRouter } from './ChatChartRouter'
import { useQueryTab } from '../Results/QueryTabContext'

type ChatMessageListProps = {
    messages: ChatMessage[]
    customRows: Map<string, DBRow[]>
    chartConfigs?: Map<string, ChartConfig>
    streamingNarrative?: string
    streamingMsgId?: string | null
    onRetry?: (userText: string) => void
}

function SqlBlock({ sql }: { sql: string }) {
    return (
        <details className="text-xs mt-2">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 select-none">
                🔍 Generated SQL
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                {sql}
            </pre>
        </details>
    )
}

function AssistantCard({
    msg,
    customRows,
    chartConfigs,
    onRetry,
    precedingUserText,
    streamingNarrative,
}: {
    msg: Extract<ChatMessage, { role: 'assistant' }>
    customRows: Map<string, DBRow[]>
    chartConfigs?: Map<string, ChartConfig>
    onRetry?: (userText: string) => void
    precedingUserText?: string
    streamingNarrative?: string
}) {
    const { payload } = msg

    if (payload.kind === 'llm-error') {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-700/50">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    ⚠️ Assistant error
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {payload.error}
                </p>
            </div>
        )
    }

    if (payload.kind === 'unsafe-sql') {
        return (
            <div className="space-y-2">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        🔒 Query blocked
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        {payload.reason}
                    </p>
                </div>
                {payload.answer.sql && <SqlBlock sql={payload.answer.sql} />}
            </div>
        )
    }

    if (payload.kind === 'sql-error') {
        return (
            <div className="space-y-2">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-700/50">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        ⚠️ Query failed
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {payload.error}
                    </p>
                    {onRetry && precedingUserText && (
                        <button
                            type="button"
                            onClick={() => onRetry(precedingUserText)}
                            className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700/40 transition-colors"
                        >
                            ↺ Retry
                        </button>
                    )}
                </div>
                <SqlBlock sql={payload.answer.sql} />
            </div>
        )
    }

    if (payload.kind === 'aborted') {
        return (
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Request cancelled.
                </p>
            </div>
        )
    }

    // payload.kind === 'ok'
    const { answer, narrative } = payload as Extract<
        AssistantPayload,
        { kind: 'ok' }
    >
    const openInQueryTab = useQueryTab()
    const rows = customRows.get(msg.id)
    const hasNoResults = rows !== undefined && rows.length === 0
    const narrativeText =
        narrative ??
        streamingNarrative ??
        (hasNoResults ? 'No results found for this query.' : answer.explanation)
    const isStreaming = !narrative && !!streamingNarrative
    return (
        <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed px-1">
                {narrativeText}
                {isStreaming && <span className="animate-pulse">▌</span>}
            </p>
            <ChatChartRouter
                answer={answer}
                rows={rows}
                chartConfig={chartConfigs?.get(msg.id)}
            />
            {answer.sql && (
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <SqlBlock sql={answer.sql} />
                    </div>
                    <button
                        onClick={() => openInQueryTab(answer.sql)}
                        aria-label="Open in Query tab"
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
                    >
                        ⌨️
                    </button>
                </div>
            )}
        </div>
    )
}

export function ChatMessageList({
    messages,
    customRows,
    chartConfigs,
    streamingNarrative,
    streamingMsgId,
    onRetry,
}: ChatMessageListProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm">
                    Ask anything about your listening history
                </p>
                <p className="text-xs mt-1">
                    e.g. "Top artists in 2022", "How often do I skip songs?",
                    "Show my listening by hour"
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {messages.map((msg, i) => {
                const prevMsg = i > 0 ? messages[i - 1] : undefined
                const precedingUserText =
                    prevMsg?.role === 'user' ? prevMsg.text : undefined

                return (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'user' ? (
                            <div className="max-w-[75%] px-4 py-2 bg-gradient-brand text-white rounded-2xl rounded-br-sm text-sm shadow-glow">
                                {msg.text}
                            </div>
                        ) : (
                            <div className="w-full">
                                <AssistantCard
                                    msg={
                                        msg as Extract<
                                            ChatMessage,
                                            { role: 'assistant' }
                                        >
                                    }
                                    customRows={customRows}
                                    chartConfigs={chartConfigs}
                                    onRetry={onRetry}
                                    precedingUserText={precedingUserText}
                                    streamingNarrative={
                                        msg.id === streamingMsgId
                                            ? streamingNarrative
                                            : undefined
                                    }
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
