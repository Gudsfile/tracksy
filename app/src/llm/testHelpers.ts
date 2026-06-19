import type { ChatAnswer } from './types'
import type { IntentName } from './intents'

export function makeChatAnswer(
    intent: IntentName = 'top_artists',
    overrides: Partial<ChatAnswer> = {}
): ChatAnswer {
    return {
        intent,
        params: {},
        title: 'Fallback Title',
        explanation: 'Artists ranked by total stream count.',
        sql: 'SELECT artist_name, COUNT(*) AS c FROM music_streams GROUP BY artist_name',
        ...overrides,
    }
}
