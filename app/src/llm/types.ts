import type { IntentName } from './intents'

export type ChatAnswerParams = {
    year?: number
    limit?: number
}

export type ChatAnswer = {
    intent: IntentName
    params: ChatAnswerParams
    title: string
    explanation: string
    sql?: string
}

export type ChatRole = 'user' | 'assistant'

export type AssistantPayload =
    | { kind: 'ok'; answer: ChatAnswer }
    | { kind: 'unsafe-sql'; answer: ChatAnswer; reason: string }
    | { kind: 'sql-error'; answer: ChatAnswer; error: string }
    | { kind: 'llm-error'; error: string }

export type ChatMessage =
    | { id: string; role: 'user'; text: string }
    | { id: string; role: 'assistant'; text: string; payload: AssistantPayload }

export type EngineState =
    | { kind: 'idle' }
    | { kind: 'unsupported'; reason: string }
    | { kind: 'loading'; progress: number; text: string }
    | { kind: 'ready' }
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
