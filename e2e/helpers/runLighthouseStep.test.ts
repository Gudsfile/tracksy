import { expect, it, vi } from 'vitest'
import { runLighthouseStep } from './runLighthouseStep'
import lighthouse from 'lighthouse'

// HACK: we rely on mock instead of spy as this is the only way to spy on the default export https://vitest.dev/guide/browser/#spying-on-module-exports
vi.mock('lighthouse', { spy: true })

it('should run lighthouse and return a report', async () => {
    vi.mocked(lighthouse).mockResolvedValue({
        lhr: {
            gatherMode: 'navigation',
            finalDisplayedUrl: 'http://test.mock',
            fetchTime: '2022-01-01T00:00:00.000Z',
            lighthouseVersion: '10.0.0',
            userAgent: 'Mozilla/5.0',
            // @ts-expect-error - configSettings is not fully typed
            configSettings: {},
            categories: {
                performance: {
                    score: 100,
                    id: 'performance',
                    title: 'Performance',
                    auditRefs: [],
                },
                accessibility: {
                    score: 100,
                    id: 'accessibility',
                    title: 'Accessibility',
                    auditRefs: [],
                },
                seo: {
                    score: 100,
                    id: 'seo',
                    title: 'SEO',
                    auditRefs: [],
                },
                'best-practices': {
                    score: 100,
                    id: 'best-practices',
                    title: 'Best Practices',
                    auditRefs: [],
                },
            },
        },
    })

    const result = await runLighthouseStep(
        'PassingTestStepName',
        'http://test.mock'
    )

    expect(result.performance).toEqual(100)
    expect(result.accessibility).toEqual(100)
    expect(result.seo).toEqual(100)
    expect(result['best-practices']).toEqual(100)
})

it('should handle errors when running lighthouse', async () => {
    vi.mocked(lighthouse).mockResolvedValue(undefined)

    await expect(
        runLighthouseStep('FailingTestStepName', 'http://fail.mock')
    ).rejects.toThrow('Lighthouse failed to run at step FailingTestStepName')
})
