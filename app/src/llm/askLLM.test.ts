import { describe, it, expect } from 'vitest'
import { extractJsonObject, parseChatAnswer } from './askLLM'
import { LLMError } from './types'

describe('extractJsonObject', () => {
    it('returns the object as-is when not wrapped', () => {
        const out = extractJsonObject('{"intent":"top_artists","params":{}}')
        expect(JSON.parse(out)).toEqual({ intent: 'top_artists', params: {} })
    })

    it('strips ```json fences', () => {
        const out = extractJsonObject(
            '```json\n{"intent":"top_artists","params":{}}\n```'
        )
        expect(JSON.parse(out).intent).toBe('top_artists')
    })

    it('strips bare ``` fences', () => {
        const out = extractJsonObject(
            '```\n{"intent":"top_artists","params":{}}\n```'
        )
        expect(JSON.parse(out).intent).toBe('top_artists')
    })

    it('extracts a balanced object out of surrounding prose', () => {
        const out = extractJsonObject(
            'Here is the JSON: {"a": "{nested}", "b": 1} thanks!'
        )
        expect(JSON.parse(out)).toEqual({ a: '{nested}', b: 1 })
    })

    it('throws LLMError(parse) when no object is present', () => {
        expect(() => extractJsonObject('no json here')).toThrow(LLMError)
    })

    it('throws LLMError(parse) on unbalanced braces', () => {
        expect(() => extractJsonObject('{"a": 1')).toThrow(LLMError)
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
