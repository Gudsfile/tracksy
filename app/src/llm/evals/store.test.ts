import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    clearRuns,
    contextsMatch,
    diffRuns,
    loadRuns,
    previousComparableRun,
    saveRun,
    type EvalContext,
    type EvalRun,
} from './store'
import type { CaseResult } from './score'

const CONTEXT: EvalContext = {
    modelId: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    chartMode: 'infer',
    narrativeMode: 'static',
    datasetId: '12345|2021-01-01|2025-01-01|678',
}

function caseResult(caseId: string, passed: boolean): CaseResult {
    return {
        caseId,
        passed,
        checks: {
            intentMatch: passed,
            paramsMatch: true,
            sqlValid: true,
            sqlExecuted: true,
            shapeOk: true,
            noRetry: true,
        },
    }
}

function run(
    startedAt: number,
    results: [string, boolean][],
    context: Partial<EvalContext> = {}
): EvalRun {
    const cases = results.map(([id, passed]) => caseResult(id, passed))
    const passed = cases.filter((c) => c.passed).length
    return {
        startedAt,
        context: { ...CONTEXT, ...context },
        score: {
            total: cases.length,
            passed,
            rate: Math.round((passed / cases.length) * 1000) / 10,
            byCheck: [],
        },
        results: cases,
    }
}

beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
})

describe('persistence', () => {
    it('round-trips a run', () => {
        const stored = run(1, [['a', true]])
        saveRun(stored)

        expect(loadRuns()).toEqual([stored])
    })

    it('keeps only the most recent runs', () => {
        for (let index = 1; index <= 8; index += 1) {
            saveRun(run(index, [['a', true]]))
        }

        const runs = loadRuns()
        expect(runs).toHaveLength(5)
        expect(runs.map((r) => r.startedAt)).toEqual([4, 5, 6, 7, 8])
    })

    it('starts clean rather than throwing on corrupt storage', () => {
        localStorage.setItem('tracksy:dev:evalRuns', 'not json{')

        expect(loadRuns()).toEqual([])
    })

    it('ignores a stored value of the wrong shape', () => {
        localStorage.setItem('tracksy:dev:evalRuns', '{"not":"an array"}')

        expect(loadRuns()).toEqual([])
    })

    it('still returns the run when storage is full', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError')
        })

        // The current session keeps its results; only persistence is lost.
        expect(() => saveRun(run(1, [['a', true]]))).not.toThrow()
    })

    it('clears', () => {
        saveRun(run(1, [['a', true]]))
        clearRuns()

        expect(loadRuns()).toEqual([])
    })
})

describe('contextsMatch', () => {
    it('requires every axis to agree', () => {
        expect(contextsMatch(CONTEXT, { ...CONTEXT })).toBe(true)

        for (const key of [
            'modelId',
            'chartMode',
            'narrativeMode',
            'datasetId',
        ] as const) {
            expect(
                contextsMatch(CONTEXT, { ...CONTEXT, [key]: 'different' }),
                key
            ).toBe(false)
        }
    })
})

describe('diffRuns', () => {
    it('classifies each case', () => {
        const previous = run(1, [
            ['stays-passing', true],
            ['gets-fixed', false],
            ['regresses', true],
            ['disappears', true],
        ])
        const current = run(2, [
            ['stays-passing', true],
            ['gets-fixed', true],
            ['regresses', false],
            ['appears', true],
        ])

        const diff = diffRuns(current, previous)

        expect(diff.comparable).toBe(true)
        expect(Object.fromEntries(diff.byCase)).toEqual({
            'stays-passing': 'unchanged',
            'gets-fixed': 'fixed',
            regresses: 'regressed',
            appears: 'new',
            disappears: 'removed',
        })
        expect(diff.fixed).toBe(1)
        expect(diff.regressed).toBe(1)
    })

    it('reports the change in pass rate', () => {
        const diff = diffRuns(
            run(2, [
                ['a', true],
                ['b', true],
            ]),
            run(1, [
                ['a', true],
                ['b', false],
            ])
        )

        expect(diff.rateChange).toBe(50)
    })

    it('refuses to compare across a dataset change', () => {
        const diff = diffRuns(
            run(2, [['a', true]]),
            run(1, [['a', false]], { datasetId: 'other' })
        )

        // Reporting "fixed" here would credit a prompt edit for a change of
        // data. Refusing is the honest answer.
        expect(diff.comparable).toBe(false)
        expect(diff.reason).toBe('the dataset changed')
        expect(diff.byCase.size).toBe(0)
        expect(diff.rateChange).toBe(0)
    })

    it('names which axis differed', () => {
        expect(
            diffRuns(
                run(2, [['a', true]]),
                run(1, [['a', true]], { modelId: 'x' })
            ).reason
        ).toBe('the model changed')
        expect(
            diffRuns(
                run(2, [['a', true]]),
                run(1, [['a', true]], { chartMode: 'llm' })
            ).reason
        ).toBe('the chart mode changed')
        expect(
            diffRuns(
                run(2, [['a', true]]),
                run(1, [['a', true]], { narrativeMode: 'stream' })
            ).reason
        ).toBe('the narrative mode changed')
    })
})

describe('previousComparableRun', () => {
    it('skips over runs that measured something else', () => {
        const runs = [
            run(1, [['a', true]]),
            run(2, [['a', true]], { modelId: 'other-model' }),
        ]

        // Run 2 is newer but not comparable; run 1 is the honest baseline.
        expect(previousComparableRun(CONTEXT, runs)?.startedAt).toBe(1)
    })

    it('prefers the most recent comparable run', () => {
        const runs = [run(1, [['a', true]]), run(3, [['a', true]])]

        expect(previousComparableRun(CONTEXT, runs)?.startedAt).toBe(3)
    })

    it('returns nothing when no run matches', () => {
        expect(
            previousComparableRun(CONTEXT, [
                run(1, [['a', true]], { datasetId: 'other' }),
            ])
        ).toBeUndefined()
    })

    it('reads from storage when no list is given', () => {
        saveRun(run(1, [['a', true]]))

        expect(previousComparableRun(CONTEXT)?.startedAt).toBe(1)
    })
})
