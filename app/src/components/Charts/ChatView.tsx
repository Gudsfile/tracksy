import { useState, useEffect, useCallback, useRef } from 'react'
import { queryDBAsJSON } from '../../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'
import { useChatEngine } from '../../hooks/useChatEngine'
import {
    summarizeQuery,
    type SummarizeDataQueryResult,
} from './Summarize/summarizeQuery'
import type { ChatMessage, AssistantPayload } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import { ModelLoader } from '../Chat/ModelLoader'
import { ChatInput } from '../Chat/ChatInput'
import { ChatMessageList } from '../Chat/ChatMessageList'

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ChatView() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [customRows, setCustomRows] = useState<Map<string, DBRow[]>>(
        new Map()
    )
    const [summarize, setSummarize] = useState<
        SummarizeDataQueryResult | undefined
    >()
    const [isAsking, setIsAsking] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { state, ensureLoaded, ask } = useChatEngine()

    const loadSummarize = useCallback(async () => {
        try {
            const results =
                await queryDBAsJSON<SummarizeDataQueryResult>(summarizeQuery)
            setSummarize(results[0])
        } catch {
            // summarize unavailable — non-fatal; charts that need maxValue will use 0
        }
    }, [])

    useEffect(() => {
        loadSummarize()
    }, [loadSummarize])

    useEffect(() => {
        const handler = () => {
            setSummarize(undefined)
            setMessages([])
            setCustomRows(new Map())
            loadSummarize()
        }
        window.addEventListener(DATA_LOADED_EVENT, handler)
        return () => window.removeEventListener(DATA_LOADED_EVENT, handler)
    }, [loadSummarize])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleEnable = useCallback(() => {
        ensureLoaded()
    }, [ensureLoaded])

    const handleSubmit = useCallback(
        async (text: string) => {
            if (state.kind !== 'ready') {
                await ensureLoaded()
                return
            }

            const userMsgId = generateId()
            const assistantMsgId = generateId()

            const userMsg: ChatMessage = {
                id: userMsgId,
                role: 'user',
                text,
            }

            setMessages((prev) => [...prev, userMsg])
            setIsAsking(true)

            const result = await ask(text, [...messages, userMsg])

            const payload: AssistantPayload = result.payload

            const assistantMsg: ChatMessage = {
                id: assistantMsgId,
                role: 'assistant',
                text:
                    payload.kind === 'ok'
                        ? JSON.stringify(payload.answer)
                        : payload.kind === 'llm-error'
                          ? `error: ${payload.error}`
                          : `error: ${payload.kind}`,
                payload,
            }

            if (
                payload.kind === 'ok' &&
                payload.answer.intent === 'custom' &&
                result.rows
            ) {
                setCustomRows((prev) => {
                    const next = new Map(prev)
                    next.set(assistantMsgId, result.rows!)
                    return next
                })
            }

            setMessages((prev) => [...prev, assistantMsg])
            setIsAsking(false)
        },
        [state.kind, ensureLoaded, ask, messages]
    )

    const isReady = state.kind === 'ready'
    const isLoading = state.kind === 'loading' || isAsking

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4">
            <ModelLoader state={state} onEnable={handleEnable} />

            {isReady && (
                <div className="flex flex-col gap-4">
                    <div className="min-h-64">
                        <ChatMessageList
                            messages={messages}
                            summarize={summarize}
                            customRows={customRows}
                        />
                        <div ref={bottomRef} />
                    </div>
                    <ChatInput
                        disabled={isLoading}
                        placeholder={
                            isAsking
                                ? 'Thinking…'
                                : 'Ask about your listening history…'
                        }
                        onSubmit={handleSubmit}
                    />
                </div>
            )}
        </div>
    )
}
