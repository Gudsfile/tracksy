import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'
import type { Suggestion } from '../llm/types'

/** Wait for a real pause in typing — a full completion per keystroke is not viable. */
const DEBOUNCE_MS = 500
/** Below this, the draft carries too little intent to suggest anything useful. */
const MIN_DRAFT_LENGTH = 8

type Options = {
    /** The in-progress text from the chat input. */
    draft: string
    /** False when suggestions are configured off or the engine isn't ready. */
    enabled: boolean
    /** True while a real answer is loading — suggestions must yield to it. */
    busy: boolean
    suggest: (draft: string, signal?: AbortSignal) => Promise<Suggestion[]>
}

/**
 * Model-generated shortcut chips for the current draft.
 *
 * Returns `[]` whenever there is nothing to show, which the chip row reads as
 * "fall back to the static shortcuts". The previous set is deliberately kept on
 * screen while a new one generates, so the row never blinks empty and shifts
 * the layout under the user's cursor.
 */
export function useChatSuggestions({ draft, enabled, busy, suggest }: Options) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const abortRef = useRef<AbortController | null>(null)
    // The draft the current `suggestions` were generated for, so an unrelated
    // re-render (or a round-trip back to the same text) doesn't re-run.
    const generatedForRef = useRef<string | null>(null)

    const debouncedDraft = useDebouncedValue(draft, DEBOUNCE_MS)
    const trimmed = debouncedDraft.trim()
    const shouldGenerate =
        enabled && !busy && trimmed.length >= MIN_DRAFT_LENGTH

    // Answers always win: abort any in-flight suggestion the moment a real
    // question starts. `askSuggestions` interrupts the running generation on
    // abort, which releases web-llm's per-model lock so the answer isn't left
    // queued behind a suggestion that no one will ever see.
    useEffect(() => {
        if (busy) {
            abortRef.current?.abort()
            abortRef.current = null
            setIsGenerating(false)
        }
    }, [busy])

    // Clear once the user empties the input, so the static chips come back.
    useEffect(() => {
        if (draft.trim().length === 0) {
            generatedForRef.current = null
            setSuggestions([])
        }
    }, [draft])

    useEffect(() => {
        if (!shouldGenerate) {
            // The run that set this flag was cancelled by the very change that
            // turned `shouldGenerate` off, so its `finally` is suppressed —
            // clear it here or the chip row stays dimmed forever.
            setIsGenerating(false)
            return
        }
        if (generatedForRef.current === trimmed) return

        const controller = new AbortController()
        abortRef.current?.abort()
        abortRef.current = controller
        setIsGenerating(true)

        let cancelled = false
        suggest(trimmed, controller.signal)
            .then((next) => {
                if (cancelled || controller.signal.aborted) return
                generatedForRef.current = trimmed
                // Keep the previous chips on an empty result rather than
                // dropping back to the statics mid-sentence.
                if (next.length > 0) setSuggestions(next)
            })
            .catch(() => {
                // Suggestions are cosmetic — leave whatever is on screen.
            })
            .finally(() => {
                if (!cancelled) setIsGenerating(false)
            })

        return () => {
            cancelled = true
            controller.abort()
        }
    }, [shouldGenerate, trimmed, suggest])

    useEffect(() => () => abortRef.current?.abort(), [])

    return { suggestions, isGenerating }
}
