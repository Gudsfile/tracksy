import type { Span } from 'webllm-otel'
import type { AskResult } from '../runAssistantTurn'
import type { EvalCase } from './cases'
import type { CaseChecks, CaseResult, SuiteScore } from './types'

// The shapes live in `./types` so `devBus` can reference them without importing
// this module, which would close an import cycle back through the pipeline.
export type { CaseChecks, CaseResult, SuiteScore } from './types'

const CHECK_ORDER: (keyof CaseChecks)[] = [
    'intentMatch',
    'paramsMatch',
    'sqlValid',
    'sqlExecuted',
    'shapeOk',
    'noRetry',
    'narratorOk',
]

/** A check fails only when it ran; an absent optional check is not a failure. */
const failedCheck = (checks: CaseChecks, check: keyof CaseChecks) =>
    checks[check] === false

/**
 * The value a narrative should mention: the label of the top row, i.e. its
 * first string column. Undefined when the rows have no label (a single metric).
 */
function topLabel(rows: Record<string, unknown>[] | undefined) {
    const first = rows?.[0]
    if (!first) return undefined
    const label = Object.values(first).find(
        (value): value is string =>
            typeof value === 'string' && value.trim().length > 0
    )
    return label?.trim()
}

function evaluateNarrative(
    narrative: string | null,
    rows: Record<string, unknown>[] | undefined
): { ok: boolean; reason?: string } {
    if (narrative === null) return { ok: false, reason: 'the narrator failed' }
    if (narrative.trim().length === 0) {
        return { ok: false, reason: 'the narrator returned no text' }
    }
    const label = topLabel(rows)
    if (label && !narrative.toLowerCase().includes(label.toLowerCase())) {
        return {
            ok: false,
            reason: `the narrative does not mention the top result "${label}"`,
        }
    }
    return { ok: true }
}

function columnsOf(rows: Record<string, unknown>[]): Set<string> {
    return new Set(rows[0] ? Object.keys(rows[0]) : [])
}

function evaluateShape(
    evalCase: EvalCase,
    rows: Record<string, unknown>[] | undefined
): { ok: boolean; reason?: string } {
    if (rows === undefined) return { ok: false, reason: 'no rows returned' }

    if (evalCase.expectRows === 'non-empty' && rows.length === 0) {
        return {
            ok: false,
            reason: 'expected rows but the query returned none',
        }
    }
    if (evalCase.maxRows !== undefined && rows.length > evalCase.maxRows) {
        return {
            ok: false,
            reason: `expected at most ${evalCase.maxRows} row(s), got ${rows.length}`,
        }
    }
    if (evalCase.expectColumns && rows.length > 0) {
        const columns = columnsOf(rows)
        const missing = evalCase.expectColumns.filter(
            (column) => !columns.has(column)
        )
        if (missing.length > 0) {
            return {
                ok: false,
                reason: `missing required column(s): ${missing.join(', ')}`,
            }
        }
    }
    return { ok: true }
}

function paramsMatch(evalCase: EvalCase, params: Record<string, unknown>) {
    const expected = evalCase.expectedParams
    if (!expected) return { ok: true }

    for (const key of ['year', 'limit'] as const) {
        const want = expected[key]
        if (want === undefined) continue
        if (params[key] !== want) {
            return {
                ok: false,
                reason: `expected ${key} ${want}, got ${String(params[key] ?? 'none')}`,
            }
        }
    }
    return { ok: true }
}

/**
 * Scores one completed turn against its case.
 *
 * Pure: it reads the result and the spans and returns a verdict. No model is
 * asked to judge anything — a 1.5B coder model grading its own output would
 * share every failure mode of the thing it is grading.
 */
export function scoreCase(
    evalCase: EvalCase,
    result: AskResult,
    spans: Span[] = [],
    /** The streamed narrative; `null` if it failed, `undefined` if not run. */
    narrative?: string | null
): CaseResult {
    const payload = result.payload
    const answer =
        payload.kind === 'aborted'
            ? undefined
            : 'answer' in payload
              ? payload.answer
              : undefined

    const reasons: Partial<Record<keyof CaseChecks, string>> = {}

    const checks: CaseChecks = {
        intentMatch: answer?.intent === evalCase.expectedIntent,
        paramsMatch: false,
        sqlValid: payload.kind !== 'unsafe-sql',
        sqlExecuted: payload.kind === 'ok',
        shapeOk: false,
        // A retry means the first SQL failed against DuckDB. The turn may still
        // have recovered, but a case that needs a second attempt is a weaker
        // result than one that does not, and hiding that would flatter the score.
        noRetry: !spans.some((span) => span.kind === 'retry'),
    }

    if (!checks.intentMatch) {
        reasons.intentMatch = `expected intent ${evalCase.expectedIntent}, got ${answer?.intent ?? 'none'}`
    }

    const params = paramsMatch(evalCase, answer?.params ?? {})
    checks.paramsMatch = params.ok
    if (params.reason) reasons.paramsMatch = params.reason

    if (!checks.sqlValid && payload.kind === 'unsafe-sql') {
        reasons.sqlValid = `guardrail rejected the SQL: ${payload.reason}`
    }

    if (!checks.sqlExecuted) {
        reasons.sqlExecuted =
            payload.kind === 'sql-error'
                ? `query failed: ${payload.error}`
                : payload.kind === 'llm-error'
                  ? `model error: ${payload.error}`
                  : payload.kind === 'aborted'
                    ? 'cancelled'
                    : 'query did not execute'
    }

    // Shape is only meaningful once the query ran; otherwise it would report a
    // second, redundant failure for the same underlying cause.
    if (checks.sqlExecuted) {
        const shape = evaluateShape(evalCase, result.rows)
        checks.shapeOk = shape.ok
        if (shape.reason) reasons.shapeOk = shape.reason
    } else {
        reasons.shapeOk = 'not evaluated — the query did not execute'
    }

    if (!checks.noRetry) {
        reasons.noRetry = 'needed a retry after the first SQL failed'
    }

    if (narrative !== undefined) {
        const verdict = evaluateNarrative(narrative, result.rows)
        checks.narratorOk = verdict.ok
        if (verdict.reason) reasons.narratorOk = verdict.reason
    }

    const failed = CHECK_ORDER.find((check) => failedCheck(checks, check))
    const rootSpan = spans.find((span) => span.parentSpanId === undefined)

    return {
        caseId: evalCase.id,
        passed: failed === undefined,
        checks,
        ...(failed && { failureReason: reasons[failed] ?? failed }),
        ...(answer?.intent && { intent: answer.intent }),
        ...(answer?.sql && { sql: answer.sql }),
        ...(result.rows && { rowCount: result.rows.length }),
        ...(rootSpan?.durationMs !== undefined && {
            durationMs: rootSpan.durationMs,
        }),
        ...(spans[0]?.traceId && { traceId: spans[0].traceId }),
    }
}

export function scoreSuite(results: CaseResult[]): SuiteScore {
    const passed = results.filter((result) => result.passed).length
    const byCheck = CHECK_ORDER.map((check) => ({
        check,
        failures: results.filter((result) => failedCheck(result.checks, check))
            .length,
    }))
        .filter((entry) => entry.failures > 0)
        .sort((a, b) => b.failures - a.failures)

    return {
        total: results.length,
        passed,
        rate:
            results.length === 0
                ? 0
                : Math.round((passed / results.length) * 1000) / 10,
        byCheck,
    }
}
