import { describe, it, expect } from 'vitest'
import { CASES, CASE_REGISTRY } from './cases'
import { INTENTS, type IntentName } from '../intents'

const INTENT_NAMES = Object.keys(INTENTS) as IntentName[]

describe('the eval case registry', () => {
    it('covers every intent', () => {
        const covered = new Set(CASES.map((c) => c.expectedIntent))
        const uncovered = INTENT_NAMES.filter((name) => !covered.has(name))

        // This is the test that keeps the suite honest as the catalogue grows:
        // adding an intent without a case would otherwise raise the pass rate
        // by simply not testing the new thing.
        expect(uncovered).toEqual([])
    })

    it('uses unique ids', () => {
        const ids = CASES.map((c) => c.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('uses ids safe to key storage and markup with', () => {
        for (const { id } of CASES) {
            expect(id).toMatch(/^[a-z0-9-]+$/)
        }
    })

    it('asks a real question in every case', () => {
        for (const { id, question } of CASES) {
            expect(question.length, id).toBeGreaterThan(10)
        }
    })

    it('only expects params the intent accepts', () => {
        for (const { id, expectedIntent, expectedParams } of CASES) {
            if (!expectedParams) continue
            const spec = INTENTS[expectedIntent]
            if (expectedParams.year !== undefined) {
                expect(spec.acceptsYear, `${id} expects a year`).toBe(true)
            }
            if (expectedParams.limit !== undefined) {
                expect(spec.acceptsLimit, `${id} expects a limit`).toBe(true)
            }
        }
    })

    it('does not require rows from a year-scoped question', () => {
        // Whether a given year has data depends on whose export is loaded.
        // Demanding rows there would score the dataset, not the model.
        for (const { id, expectedParams, expectRows } of CASES) {
            if (expectedParams?.year === undefined) continue
            expect(expectRows, `${id} is year-scoped`).not.toBe('non-empty')
        }
    })

    it('keeps maxRows consistent with expecting rows at all', () => {
        for (const { id, maxRows } of CASES) {
            if (maxRows === undefined) continue
            expect(maxRows, id).toBeGreaterThan(0)
        }
    })

    it('bundles the marker together with the cases', () => {
        // The marker must not be separable from the cases by tree-shaking, or
        // the bundle check can pass on a bundle that contains the registry.
        expect(CASE_REGISTRY.marker).toBe('TRACKSY_EVAL_CASE_MARKER')
        expect(CASE_REGISTRY.cases).toBe(CASES)
    })
})
