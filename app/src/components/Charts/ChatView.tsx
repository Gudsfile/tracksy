import { useState, useEffect, useCallback, useRef } from 'react'
import { DATA_LOADED_EVENT } from '../../db/dataSignal'
import { useChatEngine } from '../../hooks/useChatEngine'
import { useChatSuggestions } from '../../hooks/useChatSuggestions'
import type { ChatMessage, AssistantPayload } from '../../llm/types'
import type { DBRow } from '../../llm/inferChartType'
import type { ChartConfig } from '../../llm/askChartConfig'
import { ModelLoader } from '../Chat/ModelLoader'
import { AssistantSettings } from '../Chat/AssistantSettings'
import { ChatInput } from '../Chat/ChatInput'
import { ChatMessageList } from '../Chat/ChatMessageList'
import { ChatShortcuts } from '../Chat/ChatShortcuts'
import { ChatThinkingIndicator } from '../Chat/ChatThinkingIndicator'

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
    const [chartConfigs, setChartConfigs] = useState<Map<string, ChartConfig>>(
        new Map()
    )
    const [isAsking, setIsAsking] = useState(false)
    const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
    const [streamingNarrative, setStreamingNarrative] = useState('')
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [draft, setDraft] = useState('')
    const streamingMsgIdRef = useRef<string | null>(null)
    const messagesRef = useRef(messages)
    const bottomRef = useRef<HTMLDivElement>(null)

    const {
        state,
        config,
        ensureLoaded,
        enableWith,
        applyConfig,
        ask,
        suggest,
        cancel,
    } = useChatEngine()

    useEffect(() => {
        const handler = () => {
            setMessages([])
            setCustomRows(new Map())
            setChartConfigs(new Map())
        }
        window.addEventListener(DATA_LOADED_EVENT, handler)
        return () => window.removeEventListener(DATA_LOADED_EVENT, handler)
    }, [])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

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

            const result = await ask(text, [...messagesRef.current, userMsg])

            const payload: AssistantPayload = result.payload

            const assistantMsg: ChatMessage = {
                id: assistantMsgId,
                role: 'assistant',
                text:
                    payload.kind === 'ok'
                        ? JSON.stringify(payload.answer)
                        : payload.kind === 'llm-error'
                          ? `error: ${payload.error}`
                          : payload.kind === 'aborted'
                            ? 'aborted'
                            : `error: ${payload.kind}`,
                payload,
            }

            // Every successful answer renders from its executed SQL rows.
            if (payload.kind === 'ok' && result.rows) {
                setCustomRows((prev) => {
                    const next = new Map(prev)
                    next.set(assistantMsgId, result.rows!)
                    return next
                })
                if (result.chartConfig) {
                    setChartConfigs((prev) => {
                        const next = new Map(prev)
                        next.set(assistantMsgId, result.chartConfig!)
                        return next
                    })
                }
            }

            setMessages((prev) => [...prev, assistantMsg])
            setIsAsking(false)

            // Stream the narrative above the chart (desktop only; absent on
            // mobile, where the static explanation is shown instead).
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
        [state.kind, ensureLoaded, ask]
    )

    const isReady = state.kind === 'ready'
    const isLoading = state.kind === 'loading' || isAsking

    const { suggestions, isGenerating } = useChatSuggestions({
        draft,
        enabled: isReady,
        busy: isLoading,
        suggest,
    })

    // A chip always sends straight away. Clearing the draft empties the input
    // too, so a half-typed question doesn't linger behind the answer it
    // replaced.
    const handleShortcut = useCallback(
        (question: string) => {
            setDraft('')
            handleSubmit(question)
        },
        [handleSubmit]
    )

    return (
        <div className="flex flex-col gap-4 py-4">
            <MemoryNotice />

            {state.kind === 'idle' ? (
                <AssistantSettings mode="onboarding" onSubmit={enableWith} />
            ) : (
                <ModelLoader state={state} onEnable={handleEnable} />
            )}

            {isReady && settingsOpen && (
                <AssistantSettings
                    mode="settings"
                    initialConfig={config}
                    onSubmit={(next) => {
                        applyConfig(next)
                        setSettingsOpen(false)
                    }}
                    onCancel={() => setSettingsOpen(false)}
                />
            )}

            {isReady && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setSettingsOpen((v) => !v)}
                            aria-expanded={settingsOpen}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            <span aria-hidden="true" className="text-lg">
                                ⚙️
                            </span>
                            Settings
                        </button>
                    </div>
                    <div className="min-h-64">
                        <ChatMessageList
                            messages={messages}
                            customRows={customRows}
                            chartConfigs={chartConfigs}
                            streamingNarrative={streamingNarrative}
                            streamingMsgId={streamingMsgIdRef.current}
                            onRetry={handleSubmit}
                        />
                        <div ref={bottomRef} />
                    </div>
                    <ChatShortcuts
                        onSelect={handleShortcut}
                        disabled={isLoading}
                        suggestions={suggestions}
                        isGenerating={isGenerating}
                    />
                    {isAsking && <ChatThinkingIndicator />}
                    <ChatInput
                        disabled={isLoading}
                        isAsking={isAsking}
                        placeholder={
                            isAsking
                                ? 'Thinking…'
                                : 'Ask about your listening history…'
                        }
                        onSubmit={handleSubmit}
                        onCancel={cancel}
                        value={draft}
                        onChange={setDraft}
                    />
                </div>
            )}
        </div>
    )
}
