import type { IntentName } from './intents'

type ChatAnswerParams = {
    year?: number
    limit?: number
}

export type ChatAnswer = {
    intent: IntentName
    params: ChatAnswerParams
    title: string
    explanation: string
    sql: string
}

/**
 * One shortcut chip. `label` is the short text shown on the pill, `question` is
 * the full question submitted when it is clicked. Produced either by the static
 * built-in list or, while the user types, by `askSuggestions`.
 */
export type Suggestion = {
    label: string
    question: string
}

export type AssistantPayload =
    | { kind: 'ok'; answer: ChatAnswer; narrative?: string }
    | { kind: 'unsafe-sql'; answer: ChatAnswer; reason: string }
    | { kind: 'sql-error'; answer: ChatAnswer; error: string }
    | { kind: 'llm-error'; error: string }
    | { kind: 'aborted' }

export type ChatMessage =
    | { id: string; role: 'user'; text: string }
    | { id: string; role: 'assistant'; text: string; payload: AssistantPayload }

export type EngineState =
    | { kind: 'idle'; isDegraded: boolean }
    | { kind: 'unsupported'; reason: string }
    | { kind: 'loading'; progress: number; text: string }
    | { kind: 'ready'; isDegraded: boolean }
    | { kind: 'error'; error: string }

export class LLMError extends Error {
    constructor(
        message: string,
        public kind: 'parse' | 'schema' | 'aborted' | 'engine'
    ) {
        super(message)
        this.name = 'LLMError'
    }
}
