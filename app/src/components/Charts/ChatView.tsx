import { useState, useEffect, useCallback, useRef } from 'react'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'
import { useChatEngine } from '../../hooks/useChatEngine'
import type { ChatMessage, AssistantPayload } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import { ModelLoader } from '../Chat/ModelLoader'
import { ChatInput } from '../Chat/ChatInput'
import { ChatMessageList } from '../Chat/ChatMessageList'
import { ChatShortcuts } from '../Chat/ChatShortcuts'

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function MemoryNotice() {
    return (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/40 text-blue-800 dark:text-blue-300 text-sm">
            <span className="shrink-0">💡</span>
            <p>
                Chat history is stored in memory only — switching to another tab
                will clear the conversation.
            </p>
        </div>
    )
}

export function ChatView() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [customRows, setCustomRows] = useState<Map<string, DBRow[]>>(
        new Map()
    )
    const [isAsking, setIsAsking] = useState(false)
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
    const [streamingNarrative, setStreamingNarrative] = useState('')
    const streamingMsgIdRef = useRef<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { state, ensureLoaded, ask } = useChatEngine()

    useEffect(() => {
        const handler = () => {
            setMessages([])
            setCustomRows(new Map())
        }
        window.addEventListener(DATA_LOADED_EVENT, handler)
        return () => window.removeEventListener(DATA_LOADED_EVENT, handler)
    }, [])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Once the engine finishes loading, auto-send any question queued via a chip
    useEffect(() => {
        if (state.kind === 'ready' && pendingQuestion) {
            const q = pendingQuestion
            setPendingQuestion(null)
            handleSubmit(q)
        }
    }, [state.kind, pendingQuestion])

    const handleEnable = useCallback(() => {
        ensureLoaded()
    }, [ensureLoaded])

    const handleSubmit = useCallback(
        async (text: string) => {
            if (state.kind !== 'ready') {
                setPendingQuestion(text)
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

            // Stream narrative below the chart
            if (result.streamNarrator) {
                streamingMsgIdRef.current = assistantMsgId
                setStreamingNarrative('')
                const narrative = await result.streamNarrator((delta) =>
                    setStreamingNarrative((prev) => prev + delta)
                )
                streamingMsgIdRef.current = null
                setStreamingNarrative('')
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantMsgId && m.role === 'assistant'
                            ? {
                                  ...m,
                                  payload: {
                                      ...m.payload,
                                      narrative,
                                  } as AssistantPayload,
                              }
                            : m
                    )
                )
            }
        },
        [state.kind, ensureLoaded, ask, messages]
    )

    const isReady = state.kind === 'ready'
    const isLoading = state.kind === 'loading' || isAsking

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4">
            <MemoryNotice />
            <ModelLoader state={state} onEnable={handleEnable} />

            {isReady && (
                <div className="flex flex-col gap-4">
                    <div className="min-h-64">
                        <ChatMessageList
                            messages={messages}
                            customRows={customRows}
                            streamingNarrative={streamingNarrative}
                            streamingMsgId={streamingMsgIdRef.current}
                            onRetry={handleSubmit}
                        />
                        <div ref={bottomRef} />
                    </div>
                    <ChatShortcuts
                        onSelect={handleSubmit}
                        disabled={isLoading}
                    />
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
