import type {
    ChatCompletionMessageParam,
    MLCEngineInterface,
} from '@mlc-ai/web-llm'
import { isIntentName } from './intents'
import { SYSTEM_PROMPT, FEW_SHOTS } from './prompt'
import { LLMError, type ChatAnswer, type ChatMessage } from './types'

function buildMessages(
    userText: string,
    history: ChatMessage[]
): ChatCompletionMessageParam[] {
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
    ]
    for (const shot of FEW_SHOTS) {
        messages.push({ role: 'user', content: shot.user })
        messages.push({ role: 'assistant', content: shot.assistant })
    }
    // Last 4 user/assistant turns of real history
    const trimmed = history.slice(-8)
    for (const msg of trimmed) {
        messages.push({
            role: msg.role,
            content: msg.text,
        })
    }
    messages.push({ role: 'user', content: userText })
    return messages
}

export function extractJsonObject(raw: string): string {
    // Strip markdown code fences if the model added them
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fenceMatch ? fenceMatch[1] : raw

    // Find the first { and the matching } via brace counting
    const start = candidate.indexOf('{')
    if (start === -1) {
        throw new LLMError('No JSON object found in model output.', 'parse')
    }
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < candidate.length; i++) {
        const c = candidate[i]
        if (escape) {
            escape = false
            continue
        }
        if (c === '\\') {
            escape = true
            continue
        }
        if (c === '"') {
            inString = !inString
            continue
        }
        if (inString) continue
        if (c === '{') depth++
        else if (c === '}') {
            depth--
            if (depth === 0) {
                return candidate.slice(start, i + 1)
            }
        }
    }
    throw new LLMError('Unbalanced JSON braces in model output.', 'parse')
}

export function parseChatAnswer(raw: string): ChatAnswer {
    const json = extractJsonObject(raw)
    let parsed: unknown
    try {
        parsed = JSON.parse(json)
    } catch {
        throw new LLMError('Model output is not valid JSON.', 'parse')
    }
    if (typeof parsed !== 'object' || parsed === null) {
        throw new LLMError('Model output is not a JSON object.', 'schema')
    }
    const obj = parsed as Record<string, unknown>
    if (!isIntentName(obj.intent)) {
        throw new LLMError(
            `Unknown or missing intent: ${String(obj.intent)}`,
            'schema'
        )
    }
    const intent = obj.intent
    const rawParams = (obj.params ?? {}) as Record<string, unknown>
    const params: { year?: number; limit?: number } = {}
    if (typeof rawParams.year === 'number' && Number.isFinite(rawParams.year)) {
        params.year = Math.trunc(rawParams.year)
    }
    if (
        typeof rawParams.limit === 'number' &&
        Number.isFinite(rawParams.limit)
    ) {
        params.limit = Math.trunc(rawParams.limit)
    }
    const title =
        typeof obj.title === 'string' && obj.title.trim().length > 0
            ? obj.title.trim()
            : 'Result'
    const explanation =
        typeof obj.explanation === 'string' ? obj.explanation.trim() : ''
    const sql = typeof obj.sql === 'string' ? obj.sql : undefined

    if (intent === 'custom' && (!sql || sql.trim().length === 0)) {
        throw new LLMError(
            'Custom intent requires a non-empty SQL string.',
            'schema'
        )
    }

    return { intent, params, title, explanation, sql }
}

export async function askLLM(
    engine: MLCEngineInterface,
    userText: string,
    history: ChatMessage[]
): Promise<ChatAnswer> {
    const messages = buildMessages(userText, history)
    let response
    try {
        response = await engine.chat.completions.create({
            messages,
            temperature: 0.1,
            max_tokens: 512,
        })
    } catch (e) {
        const reason = e instanceof Error ? e.message : String(e)
        throw new LLMError(reason, 'engine')
    }
    if (
        !('choices' in response) ||
        !response.choices?.length ||
        !response.choices[0].message?.content
    ) {
        throw new LLMError('Empty response from model.', 'engine')
    }
    return parseChatAnswer(response.choices[0].message.content)
}
