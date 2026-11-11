import type { IntentName } from '../intents'

/**
 * Data shapes for eval results, kept in a leaf module.
 *
 * These live apart from `score.ts` and `store.ts` because `devBus` needs them to
 * type its event map, and importing them from `score.ts` created a genuine
 * import cycle: devBus → score → runAssistantTurn → queryDB → devBus. Only the
 * *functions* in those modules need the pipeline; the shapes do not, so the
 * shapes move here and nothing depends on anything that depends back.
 */

/**
 * Independent checks, each answering one question about the answer.
 *
 * Kept separate rather than collapsed into a single boolean because "the case
 * failed" is not actionable: a wrong intent, SQL the guardrail rejected, and SQL
 * that executed but produced an unrenderable shape are three different problems
 * with three different fixes.
 */
export type CaseChecks = {
    /** The router picked the expected intent. */
    intentMatch: boolean
    /** Year/limit were extracted as the question stated them. */
    paramsMatch: boolean
    /** The SQL passed `validateSql`. */
    sqlValid: boolean
    /** DuckDB executed it without error. */
    sqlExecuted: boolean
    /** Row count and required columns match what the renderer needs. */
    shapeOk: boolean
    /** The answer was right first time, with no error-correction round trip. */
    noRetry: boolean
}

export type CaseResult = {
    caseId: string
    passed: boolean
    checks: CaseChecks
    /** The first check that failed, phrased for a human. */
    failureReason?: string
    intent?: IntentName
    sql?: string
    rowCount?: number
    durationMs?: number
    /** Links the result to its spans, so a failure can be expanded in place. */
    traceId?: string
}

export type SuiteScore = {
    total: number
    passed: number
    /** Pass rate as a percentage, rounded to one decimal. */
    rate: number
    /** How many cases failed each check, worst first. */
    byCheck: { check: keyof CaseChecks; failures: number }[]
}

/**
 * Everything that changes what a score means.
 *
 * Two runs are comparable only when all of these match. A model swap, a chart
 * mode change, or a different dataset all move the number for reasons that have
 * nothing to do with the prompt you just edited.
 */
export type EvalContext = {
    modelId: string
    chartMode: string
    narrativeMode: string
    /** From `datasetFingerprint()`. */
    datasetId: string
}

export type EvalRun = {
    /** Epoch milliseconds. Supplied by the caller so the store stays pure. */
    startedAt: number
    /** What the run was measuring — a comparison is only valid within one. */
    context: EvalContext
    score: SuiteScore
    results: CaseResult[]
}

export type CaseDelta = 'fixed' | 'regressed' | 'unchanged' | 'new' | 'removed'

export type RunDiff = {
    comparable: boolean
    /** Why a comparison was refused, for the UI to show instead of a delta. */
    reason?: string
    byCase: Map<string, CaseDelta>
    fixed: number
    regressed: number
    rateChange: number
}
