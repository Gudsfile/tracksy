import { describe, it, expect } from 'vitest'
import type { Span } from 'webllm-otel'
import { scoreCase, scoreSuite, type CaseResult } from './score'
import type { EvalCase } from './cases'
import type { AskResult } from '../runAssistantTurn'
import { makeChatAnswer } from '../testHelpers'

const CASE: EvalCase = {
    id: 'top-artists',
    question: 'Who are my top artists?',
    expectedIntent: 'top_artists',
    expectRows: 'non-empty',
}

const ROWS = [{ artist_name: 'Boards of Canada', count_streams: 42 }]

function okResult(overrides: Partial<AskResult> = {}): AskResult {
    return {
        payload: { kind: 'ok', answer: makeChatAnswer('top_artists') },
        rows: ROWS,
        ...overrides,
    }
}

function span(overrides: Partial<Span> = {}): Span {
    return {
        traceId: 'a'.repeat(32),
        spanId: 'b'.repeat(16),
        name: 'step',
        kind: 'duckdb',
        startTimeUnixNano: '1700000000000000000',
        status: 'ok',
        attributes: {},
        ...overrides,
    }
}

describe('scoreCase — passing', () => {
    it('passes when every check holds', () => {
        const result = scoreCase(CASE, okResult())

        expect(result.passed).toBe(true)
        expect(result.failureReason).toBeUndefined()
        expect(result.checks).toEqual({
            intentMatch: true,
            paramsMatch: true,
            sqlValid: true,
            sqlExecuted: true,
            shapeOk: true,
            noRetry: true,
        })
    })

    it('carries the details needed to inspect the answer', () => {
        const result = scoreCase(CASE, okResult(), [
            span({ parentSpanId: undefined, kind: 'turn', durationMs: 1500 }),
        ])

        expect(result.intent).toBe('top_artists')
        expect(result.sql).toContain('SELECT')
        expect(result.rowCount).toBe(1)
        expect(result.durationMs).toBe(1500)
        expect(result.traceId).toBe('a'.repeat(32))
    })
})

describe('scoreCase — intent and params', () => {
    it('fails on the wrong intent and says which was picked', () => {
        const result = scoreCase(CASE, {
            payload: { kind: 'ok', answer: makeChatAnswer('top_tracks') },
            rows: ROWS,
        })

        expect(result.checks.intentMatch).toBe(false)
        expect(result.failureReason).toBe(
            'expected intent top_artists, got top_tracks'
        )
    })

    it('checks an expected limit', () => {
        const limitCase: EvalCase = {
            ...CASE,
            id: 'top-artists-limit',
            expectedParams: { limit: 5 },
        }

        expect(
            scoreCase(limitCase, {
                payload: {
                    kind: 'ok',
                    answer: makeChatAnswer('top_artists', {
                        params: { limit: 5 },
                    }),
                },
                rows: ROWS,
            }).checks.paramsMatch
        ).toBe(true)

        const missed = scoreCase(limitCase, okResult())
        expect(missed.checks.paramsMatch).toBe(false)
        expect(missed.failureReason).toBe('expected limit 5, got none')
    })

    it('ignores params the case does not pin down', () => {
        // The router is told to omit `year` unless asked; a case that says
        // nothing about it must not penalise either choice.
        const result = scoreCase(CASE, {
            payload: {
                kind: 'ok',
                answer: makeChatAnswer('top_artists', {
                    params: { year: 2024 },
                }),
            },
            rows: ROWS,
        })

        expect(result.checks.paramsMatch).toBe(true)
    })
})

describe('scoreCase — SQL', () => {
    it('fails when the guardrail rejected the SQL', () => {
        const result = scoreCase(CASE, {
            payload: {
                kind: 'unsafe-sql',
                answer: makeChatAnswer('top_artists'),
                reason: 'DROP is not allowed',
            },
        })

        expect(result.checks.sqlValid).toBe(false)
        expect(result.failureReason).toContain('DROP is not allowed')
    })

    it('fails when the query errored', () => {
        const result = scoreCase(CASE, {
            payload: {
                kind: 'sql-error',
                answer: makeChatAnswer('top_artists'),
                error: 'no such column: nope',
            },
        })

        expect(result.checks.sqlExecuted).toBe(false)
        expect(result.failureReason).toBe('query failed: no such column: nope')
    })

    it('reports a model error distinctly from a query error', () => {
        const result = scoreCase(CASE, {
            payload: { kind: 'llm-error', error: 'device lost' },
        })

        expect(result.checks.intentMatch).toBe(false)
        expect(result.checks.sqlExecuted).toBe(false)
        expect(result.checks.shapeOk).toBe(false)
    })

    it('does not double-report shape when the query never ran', () => {
        const result = scoreCase(CASE, {
            payload: {
                kind: 'sql-error',
                answer: makeChatAnswer('top_artists'),
                error: 'boom',
            },
        })

        // The first failing check is the real cause; shape is downstream noise.
        expect(result.failureReason).toBe('query failed: boom')
    })

    it('handles an aborted turn', () => {
        const result = scoreCase(CASE, { payload: { kind: 'aborted' } })

        expect(result.passed).toBe(false)
        expect(result.checks.sqlExecuted).toBe(false)
    })
})

describe('scoreCase — shape', () => {
    it('fails when rows were required but none came back', () => {
        const result = scoreCase(CASE, okResult({ rows: [] }))

        expect(result.checks.shapeOk).toBe(false)
        expect(result.failureReason).toBe(
            'expected rows but the query returned none'
        )
    })

    it('accepts an empty result when the case allows it', () => {
        const anyRows: EvalCase = { ...CASE, expectRows: 'any' }

        expect(scoreCase(anyRows, okResult({ rows: [] })).passed).toBe(true)
    })

    it('enforces maxRows', () => {
        const single: EvalCase = { ...CASE, maxRows: 1 }
        const result = scoreCase(
            single,
            okResult({ rows: [ROWS[0]!, ROWS[0]!, ROWS[0]!] })
        )

        expect(result.failureReason).toBe('expected at most 1 row(s), got 3')
    })

    it('names the columns the renderer needs but did not get', () => {
        const skipRate: EvalCase = {
            ...CASE,
            id: 'skip-rate',
            expectColumns: ['complete_listens', 'skipped_listens'],
        }
        const result = scoreCase(
            skipRate,
            okResult({ rows: [{ complete_listens: 10 }] })
        )

        expect(result.failureReason).toBe(
            'missing required column(s): skipped_listens'
        )
    })

    it('skips the column check when there are no rows to inspect', () => {
        const withColumns: EvalCase = {
            ...CASE,
            expectRows: 'any',
            expectColumns: ['play_hour'],
        }

        expect(scoreCase(withColumns, okResult({ rows: [] })).passed).toBe(true)
    })
})

describe('scoreCase — retry', () => {
    it('marks an answer that needed a second attempt', () => {
        const result = scoreCase(CASE, okResult(), [
            span({ kind: 'retry', name: 'sql-correction' }),
        ])

        // The turn recovered, but a case needing error correction is a weaker
        // result than one that does not, and the score should say so.
        expect(result.checks.noRetry).toBe(false)
        expect(result.passed).toBe(false)
        expect(result.failureReason).toBe(
            'needed a retry after the first SQL failed'
        )
    })
})

describe('scoreSuite', () => {
    function result(id: string, passed: boolean, checks = {}): CaseResult {
        return {
            caseId: id,
            passed,
            checks: {
                intentMatch: passed,
                paramsMatch: true,
                sqlValid: true,
                sqlExecuted: true,
                shapeOk: true,
                noRetry: true,
                ...checks,
            },
        }
    }

    it('summarises the pass rate', () => {
        const score = scoreSuite([
            result('a', true),
            result('b', true),
            result('c', false),
        ])

        expect(score).toMatchObject({ total: 3, passed: 2, rate: 66.7 })
    })

    it('ranks the checks by how often they failed', () => {
        const score = scoreSuite([
            result('a', false, { intentMatch: false, shapeOk: false }),
            result('b', false, { intentMatch: false }),
            result('c', true),
        ])

        expect(score.byCheck).toEqual([
            { check: 'intentMatch', failures: 2 },
            { check: 'shapeOk', failures: 1 },
        ])
    })

    it('handles an empty suite without dividing by zero', () => {
        expect(scoreSuite([])).toEqual({
            total: 0,
            passed: 0,
            rate: 0,
            byCheck: [],
        })
    })
})
