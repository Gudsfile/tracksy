import { expect, it } from 'vitest'
import { computeJourneyScore } from './computeJourneyScore'

const STEP_WEIGHTS_FOR_TEST = {
    landing: 0.25,
    afterUpload: 0.45, // heaviest: users rage here
    simpleViewRendered: 0.3,
}

it('should return 0 when no journey data is provided', () => {
    // @ts-expect-error - empty object is not assignable
    const score = computeJourneyScore({}, STEP_WEIGHTS_FOR_TEST)
    expect(score).toBe(0)
})

it('should calculate a positive score for a valid journey', () => {
    const journey = {
        landing: {
            performance: 1,
            accessibility: 1,
            seo: 1,
            'best-practices': 1,
        },
        afterUpload: {
            performance: 1,
            accessibility: 1,
            seo: 1,
            'best-practices': 1,
        },
        simpleViewRendered: {
            performance: 1,
            accessibility: 1,
            seo: 1,
            'best-practices': 1,
        },
    }
    const score = computeJourneyScore(journey, STEP_WEIGHTS_FOR_TEST)
    expect(score).toBeGreaterThan(0)
})

it('should handle journeys with failed steps', () => {
    const journey = {
        landing: {
            performance: 1,
            accessibility: 1,
            seo: 1,
            'best-practices': 1,
        },
        afterUpload: {
            performance: 0,
            accessibility: 0,
            seo: 0,
            'best-practices': 0,
        },
        simpleViewRendered: {
            performance: 1,
            accessibility: 1,
            seo: 1,
            'best-practices': 1,
        },
    }
    const score = computeJourneyScore(journey, STEP_WEIGHTS_FOR_TEST)
    expect(score).toBeLessThan(100)
})
