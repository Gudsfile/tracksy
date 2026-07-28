import { describe, it, expect } from 'vitest'
import { parseChatAnswer } from './askLLM'
import { SYSTEM_PROMPT, FEW_SHOTS } from './prompt'
import { LLMError } from './types'

describe('prompt date context', () => {
    const currentYear = new Date().getFullYear()

    it('includes the current year in SYSTEM_PROMPT', () => {
        expect(SYSTEM_PROMPT).toContain(String(currentYear))
    })

    it('has a few-shot that maps "this year" to the current year', () => {
        const shot = FEW_SHOTS.find((s) =>
            s.user.toLowerCase().includes('this year')
        )
        expect(shot).toBeDefined()
        expect(shot!.assistant).toContain(String(currentYear))
    })
})

describe('parseChatAnswer', () => {
    it('parses a known intent with params and sql', () => {
        const answer = parseChatAnswer(
            JSON.stringify({
                intent: 'top_tracks',
                params: { year: 2023, limit: 10 },
                title: 'Top tracks 2023',
                explanation: 'Most-played tracks of 2023.',
                sql: 'SELECT track_name FROM music_streams LIMIT 10',
            })
        )
        expect(answer.intent).toBe('top_tracks')
        expect(answer.params).toEqual({ year: 2023, limit: 10 })
        expect(answer.title).toBe('Top tracks 2023')
        expect(answer.sql).toBe('SELECT track_name FROM music_streams LIMIT 10')
    })

    it('rejects unknown intent', () => {
        const raw = JSON.stringify({
            intent: 'definitely_not_a_real_intent',
            params: {},
        })
        expect(() => parseChatAnswer(raw)).toThrow(LLMError)
    })

    it('requires sql for all intents', () => {
        for (const intent of ['custom', 'top_artists', 'skip_rate'] as const) {
            const raw = JSON.stringify({
                intent,
                params: {},
                title: 't',
                explanation: 'e',
            })
            expect(() => parseChatAnswer(raw), intent).toThrow(LLMError)
        }
    })

    it('keeps sql value from response', () => {
        const raw = JSON.stringify({
            intent: 'top_artists',
            params: {},
            title: 't',
            explanation: 'e',
            sql: 'SELECT artist_name FROM music_streams LIMIT 5',
        })
        const answer = parseChatAnswer(raw)
        expect(answer.sql).toBe('SELECT artist_name FROM music_streams LIMIT 5')
    })

    it('truncates non-integer year/limit', () => {
        const raw = JSON.stringify({
            intent: 'top_artists',
            params: { year: 2023.4, limit: 5.9 },
            title: 't',
            explanation: 'e',
            sql: 'SELECT 1',
        })
        const answer = parseChatAnswer(raw)
        expect(answer.params.year).toBe(2023)
        expect(answer.params.limit).toBe(5)
    })

    it('falls back to default title if missing', () => {
        const raw = JSON.stringify({
            intent: 'top_artists',
            params: {},
            explanation: 'e',
            sql: 'SELECT 1',
        })
        const answer = parseChatAnswer(raw)
        expect(answer.title.length).toBeGreaterThan(0)
    })
})
