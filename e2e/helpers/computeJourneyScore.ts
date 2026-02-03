import { runLighthouseStep } from './runLighthouseStep'

const CATEGORY_WEIGHTS = {
    performance: 0.5,
    accessibility: 0.3,
    bestPractices: 0.15,
    seo: 0.05,
}

export function computeJourneyScore<T extends string>(
    stepsScores: Record<
        T,
        Awaited<ReturnType<typeof runLighthouseStep>> | undefined
    >,
    stepsWeights: Record<T, number>
) {
    let total = 0
    for (const rawStep of Object.keys(stepsScores)) {
        const step = rawStep as T
        const scores = stepsScores[step]
        const weight = stepsWeights[step] ?? 0
        if (weight === 0) {
            console.warn(`No weight definition found for step: ${step}`)
        }

        if (!scores) continue

        const stepScore =
            (scores.performance ?? 0) * CATEGORY_WEIGHTS.performance +
            (scores.accessibility ?? 0) * CATEGORY_WEIGHTS.accessibility +
            (scores['best-practices'] ?? 0) * CATEGORY_WEIGHTS.bestPractices +
            (scores.seo ?? 0) * CATEGORY_WEIGHTS.seo

        total += stepScore * weight
    }

    return Math.round(total * 100)
}
