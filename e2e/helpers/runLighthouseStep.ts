import { config } from '../ligthhouse.config'

export async function runLighthouseStep(stepName: string, url: string) {
    const { default: lighthouse } = await import('lighthouse')
    const { default: desktopConfig } =
        await import('lighthouse/core/config/desktop-config.js')

    const result = await lighthouse(url, config, desktopConfig)

    if (!result) throw new Error(`Lighthouse failed to run at step ${stepName}`)

    const stepScores = {
        performance: result.lhr.categories.performance.score,
        accessibility: result.lhr.categories.accessibility.score,
        seo: result.lhr.categories.seo.score,
        'best-practices': result.lhr.categories['best-practices'].score,
    }

    return stepScores
}
