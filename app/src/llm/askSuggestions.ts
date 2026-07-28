import type { ChatCompletion, MLCEngineInterface } from '@mlc-ai/web-llm'
import { SCHEMA_DESCRIPTION, CURRENT_DATE } from './prompt'
import { SHORTCUTS } from './shortcuts'
import { extractJsonArray } from './extractJson'
import { LLMError, type Suggestion } from './types'
import { devBus } from '../devToolbar/devBus'
import { getLoadedModelId } from './modelState'

/** Never show more than this many generated chips — the row must stay scannable. */
const MAX_SUGGESTIONS = 4
/** Longer labels blow out the pill width, especially on mobile. */
const MAX_LABEL_LENGTH = 24

const EXAMPLE_QUESTIONS = SHORTCUTS.map((s) => `  - ${s.question}`).join('\n')

const SUGGESTIONS_SYSTEM_PROMPT = `\
You help someone explore their own music listening history. They are part-way through typing a question. Propose ${MAX_SUGGESTIONS} complete questions they might have meant, so they can click one instead of finishing the sentence.

${SCHEMA_DESCRIPTION}

Style examples (match this tone and length):
${EXAMPLE_QUESTIONS}

Rules:
- Every question must be answerable from the schema above. Never ask about genres, lyrics, moods, friends, or anything not present in the data.
- Continue the user's partial input — stay on the subject they started. Do not drift to unrelated topics.
- Write questions in the user's own voice, using "my" and "I".
- Make the ${MAX_SUGGESTIONS} questions meaningfully different from each other, not four rewordings of one idea.
- Each label is a short chip caption, at most ${MAX_LABEL_LENGTH} characters, no trailing punctuation.
- If real artist names are provided below, feel free to use them.

Respond with ONLY a JSON array, no prose and no code fences:
[{"label": "Top artists", "question": "Who are my top 5 most listened to artists?"}]`

/**
 * Parse and sanitize the model's suggestion array.
 *
 * Suggestions are cosmetic, so this is deliberately forgiving: malformed
 * entries are dropped rather than failing the batch, and anything
 * unrecoverable yields an empty list so the caller falls back to the static
 * shortcuts.
 */
export function parseSuggestions(raw: string): Suggestion[] {
    let parsed: unknown
    try {
        parsed = JSON.parse(extractJsonArray(raw))
    } catch {
        return []
    }
    if (!Array.isArray(parsed)) return []

    const out: Suggestion[] = []
    const seen = new Set<string>()
    for (const entry of parsed) {
        if (typeof entry !== 'object' || entry === null) continue
        const { label, question } = entry as Record<string, unknown>
        if (typeof label !== 'string' || typeof question !== 'string') continue
        const trimmedLabel = label.trim()
        const trimmedQuestion = question.trim()
        if (!trimmedLabel || !trimmedQuestion) continue
        if (seen.has(trimmedQuestion)) continue
        seen.add(trimmedQuestion)
        out.push({
            label: trimmedLabel.slice(0, MAX_LABEL_LENGTH),
            question: trimmedQuestion,
        })
        if (out.length === MAX_SUGGESTIONS) break
    }
    return out
}

/**
 * Ask the model for shortcut chips that continue the user's partial input.
 *
 * Runs on the engine passed in — always the one already loaded — and never
 * throws: any failure returns `[]` so the UI keeps showing the static chips.
 */
export async function askSuggestions(
    engine: MLCEngineInterface,
    draft: string,
    dataContext?: string,
    signal?: AbortSignal
): Promise<Suggestion[]> {
    // Superseded before we started — don't occupy the engine at all.
    if (signal?.aborted) return []

    const context = dataContext ? `\n\n${dataContext}` : ''
    const messages = [
        { role: 'system' as const, content: SUGGESTIONS_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `[Today is ${CURRENT_DATE}.]${context}\n\nPartial input: "${draft}"`,
        },
    ]

    const start = performance.now()
    let response: ChatCompletion
    try {
        const completionPromise = engine.chat.completions.create({
            messages,
            temperature: 0.4,
            max_tokens: 200,
        }) as Promise<ChatCompletion>
        if (signal) {
            const abortPromise = new Promise<never>((_, reject) => {
                signal.addEventListener('abort', () => {
                    // web-llm serializes requests per model behind a lock, so
                    // dropping our promise is not enough: the pipeline keeps
                    // decoding and the user's real question queues behind it.
                    // Interrupting stops generation at the next token and
                    // releases the lock, which is the whole point of yielding.
                    engine.interruptGenerate()
                    reject(new LLMError('Cancelled', 'aborted'))
                })
            })
            response = await Promise.race([completionPromise, abortPromise])
        } else {
            response = await completionPromise
        }
    } catch {
        return []
    }

    const durationMs = performance.now() - start
    const tokens = response.usage?.completion_tokens ?? 0
    devBus.emit('webllm:inference', {
        model: getLoadedModelId(),
        durationMs,
        tokensPerSec: durationMs > 0 ? tokens / (durationMs / 1000) : 0,
        // Tagged so short suggestion runs don't read as answer latency in the
        // dev toolbar.
        kind: 'suggestions',
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) return []
    return parseSuggestions(content)
}
