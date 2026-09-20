import { describe, it, expect } from 'vitest'
import { buildMessages, extractJsonObject, parseChatAnswer } from './askLLM'
import { SYSTEM_PROMPT, FEW_SHOTS } from './prompt'
import { LLMError, type ChatMessage } from './types'

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

describe('buildMessages', () => {
    const currentYear = new Date().getFullYear()

    function lastContent(messages: ReturnType<typeof buildMessages>): string {
        return String(messages[messages.length - 1].content)
    }

    it('sends the question verbatim when it names no year', () => {
        const content = lastContent(buildMessages('Top artists', []))

        expect(content).toBe('Top artists')
        expect(content).not.toContain('[Today is')
    })

    it('drops the prefix entirely — a date-only prefix still triggers a year filter', () => {
        const bareQuestions = [
            'Who are my top 5 most listened to artists?',
            'How often do I skip songs?',
            'How many different artists have I listened to?',
        ]
        for (const question of bareQuestions) {
            expect(lastContent(buildMessages(question, [])), question).toBe(
                question
            )
        }
    })

    it('prefixes an explicit year with the date context', () => {
        const content = lastContent(buildMessages('Top 3 tracks in 2022', []))

        expect(content).toContain('[Today is')
        expect(content).toContain('The user is asking about year 2022.')
        expect(content).toContain('Top 3 tracks in 2022')
    })

    it('resolves "last year" to the previous year', () => {
        const content = lastContent(
            buildMessages('What did I listen to last year?', [])
        )

        expect(content).toContain(
            `The user is asking about year ${currentYear - 1}.`
        )
    })

    it('resolves "this year" to the current year', () => {
        const content = lastContent(
            buildMessages('What are my top artists this year?', [])
        )

        expect(content).toContain(
            `The user is asking about year ${currentYear}.`
        )
    })

    it('sends the current turn exactly once, after the prior history', () => {
        const question = 'Do I listen to more music on rainy Tuesdays?'
        const history: ChatMessage[] = [
            { id: '1', role: 'user', text: 'Top artists' },
            {
                id: '2',
                role: 'assistant',
                text: '{"intent":"top_artists"}',
                payload: { kind: 'aborted' },
            },
        ]

        const messages = buildMessages(question, history)
        const currentTurn = messages.filter((m) =>
            String(m.content).includes(question)
        )

        expect(currentTurn).toHaveLength(1)
        expect(currentTurn[0].role).toBe('user')
        expect(messages[messages.length - 1]).toBe(currentTurn[0])
    })
})

describe('FEW_SHOTS date-prefix invariant', () => {
    // buildMessages only prefixes questions that resolve to a year, so the
    // few-shots must show exactly what it would send — a shot that pairs a
    // bare question with a prefix (or the reverse) is what caused the
    // spurious current-year filter in the first place.
    //
    // Compare on the question with the prefix stripped: the prefix embeds
    // today's date, so resolving the full text always finds a year and would
    // let a bare question wearing a prefix slip through.
    it('shows each question exactly as buildMessages would send it', () => {
        for (const shot of FEW_SHOTS) {
            const question = shot.user.replace(/^\[Today is [^\]]*\] /, '')
            const messages = buildMessages(question, [])
            expect(shot.user, question).toBe(
                messages[messages.length - 1].content
            )
        }
    })
})

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
