import type { ChatMessage } from '../../llm/types'
import type { SummarizeDataQueryResult } from '../Charts/Summarize/summarizeQuery'
import type { DBRow } from '../../llm/inferChartType'
import { ChatChartRouter } from './ChatChartRouter'

type ChatMessageListProps = {
    messages: ChatMessage[]
    summarize?: SummarizeDataQueryResult
    customRows: Map<string, DBRow[]>
}

function AssistantCard({
    msg,
    summarize,
    customRows,
}: {
    msg: Extract<ChatMessage, { role: 'assistant' }>
    summarize?: SummarizeDataQueryResult
    customRows: Map<string, DBRow[]>
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
                {payload.answer.sql && (
                    <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            See generated SQL
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                            {payload.answer.sql}
                        </pre>
                    </details>
                )}
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
                </div>
                <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        See generated SQL
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                        {payload.answer.sql}
                    </pre>
                </details>
            </div>
        )
    }

    // payload.kind === 'ok'
    const { answer } = payload
    return (
        <div className="space-y-2">
            <ChatChartRouter
                answer={answer}
                rows={customRows.get(msg.id)}
                summarize={summarize}
            />
            <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    ℹ️ {answer.explanation}
                </summary>
                {answer.sql && (
                    <pre className="mt-2 p-3 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto whitespace-pre-wrap break-all">
                        {answer.sql}
                    </pre>
                )}
            </details>
        </div>
    )
}

export function ChatMessageList({
    messages,
    summarize,
    customRows,
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
            {messages.map((msg) => (
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
                                summarize={summarize}
                                customRows={customRows}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
