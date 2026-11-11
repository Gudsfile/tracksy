import type { CaseDelta, EvalContext, EvalRun, RunDiff } from './types'

// Shapes live in `./types` so `devBus` can type its event map without importing
// this module — see the note there about the import cycle that caused.
export type { CaseDelta, EvalContext, EvalRun, RunDiff } from './types'

const STORAGE_KEY = 'tracksy:dev:evalRuns'

/**
 * How many runs to keep. Enough to see a couple of iterations back while tuning
 * a prompt; small enough that captured SQL and reasons cannot fill localStorage.
 */
const MAX_RUNS = 5

export function contextsMatch(a: EvalContext, b: EvalContext): boolean {
    return (
        a.modelId === b.modelId &&
        a.chartMode === b.chartMode &&
        a.narrativeMode === b.narrativeMode &&
        a.datasetId === b.datasetId
    )
}

function describeMismatch(a: EvalContext, b: EvalContext): string | undefined {
    if (a.datasetId !== b.datasetId) return 'the dataset changed'
    if (a.modelId !== b.modelId) return 'the model changed'
    if (a.chartMode !== b.chartMode) return 'the chart mode changed'
    if (a.narrativeMode !== b.narrativeMode) return 'the narrative mode changed'
    return undefined
}

/**
 * Compares two runs case by case.
 *
 * Refuses rather than misleads: if the runs measured different things, the delta
 * would attribute a dataset swap to whatever prompt edit happened to come with
 * it, which is worse than showing nothing.
 */
export function diffRuns(current: EvalRun, previous: EvalRun): RunDiff {
    const reason = describeMismatch(current.context, previous.context)
    if (reason) {
        return {
            comparable: false,
            reason,
            byCase: new Map(),
            fixed: 0,
            regressed: 0,
            rateChange: 0,
        }
    }

    const previousByCase = new Map(
        previous.results.map((result) => [result.caseId, result])
    )
    const byCase = new Map<string, CaseDelta>()
    let fixed = 0
    let regressed = 0

    for (const result of current.results) {
        const before = previousByCase.get(result.caseId)
        if (!before) {
            byCase.set(result.caseId, 'new')
            continue
        }
        if (before.passed === result.passed) {
            byCase.set(result.caseId, 'unchanged')
        } else if (result.passed) {
            byCase.set(result.caseId, 'fixed')
            fixed += 1
        } else {
            byCase.set(result.caseId, 'regressed')
            regressed += 1
        }
    }

    // Cases present before but not now — a shrunk selection, or a deleted case.
    for (const caseId of previousByCase.keys()) {
        if (!byCase.has(caseId)) byCase.set(caseId, 'removed')
    }

    return {
        comparable: true,
        byCase,
        fixed,
        regressed,
        rateChange:
            Math.round((current.score.rate - previous.score.rate) * 10) / 10,
    }
}

function storage(): Storage | undefined {
    // Absent in SSR, and disabled outright in some privacy modes. Losing run
    // history is not worth throwing over.
    try {
        return typeof localStorage === 'undefined' ? undefined : localStorage
    } catch {
        return undefined
    }
}

export function loadRuns(): EvalRun[] {
    const store = storage()
    if (!store) return []
    try {
        const raw = store.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as EvalRun[]) : []
    } catch {
        // Corrupt or from an older shape — start clean rather than crash the
        // toolbar on read.
        return []
    }
}

/** Appends a run and returns the retained history, oldest first. */
export function saveRun(run: EvalRun): EvalRun[] {
    const runs = [...loadRuns(), run].slice(-MAX_RUNS)
    const store = storage()
    try {
        store?.setItem(STORAGE_KEY, JSON.stringify(runs))
    } catch {
        // Quota exceeded: the run is still returned so the current session can
        // show it, it just will not survive a reload.
    }
    return runs
}

export function clearRuns(): void {
    try {
        storage()?.removeItem(STORAGE_KEY)
    } catch {
        // Nothing useful to do; the caller reads an empty list either way.
    }
}

/**
 * The most recent run comparable with `context`, ignoring any in between that
 * measured something else.
 */
export function previousComparableRun(
    context: EvalContext,
    runs: EvalRun[] = loadRuns()
): EvalRun | undefined {
    for (let index = runs.length - 1; index >= 0; index -= 1) {
        const run = runs[index]
        if (run && contextsMatch(run.context, context)) return run
    }
    return undefined
}
