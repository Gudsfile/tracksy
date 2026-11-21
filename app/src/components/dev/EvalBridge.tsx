import { useEffect, useRef } from 'react'
import { devBus } from '../../devToolbar/devBus'
import { getStoredConfig } from '../../llm/assistantConfig'
import { CASE_REGISTRY, type EvalCase } from '../../llm/evals/cases'
import {
    datasetFingerprint,
    describeFingerprint,
    NO_DATASET,
} from '../../llm/evals/fingerprint'
import { scoreCase, scoreSuite, type CaseResult } from '../../llm/evals/score'
import { saveRun, type EvalRun } from '../../llm/evals/store'
import type { AssistantConfig } from '../../llm/assistantConfig'

/**
 * Executes eval runs on behalf of the dev toolbar.
 *
 * Renders nothing. It exists because the toolbar cannot do this itself: toolbar
 * apps load in their own module graph, so calling `getEngine` there would create
 * a second engine and download the model a second time. This component lives in
 * the page's graph alongside `ChatView`, so whichever loads the engine first, both
 * share it.
 *
 * The whole module is dev-only and reached through a dynamic import behind
 * `import.meta.env.DEV`; `moon run app:assert-no-dev-code` fails the build if any
 * of it reaches production.
 */
export function EvalBridge() {
    // Guards against a second run being started while one is in flight — the
    // engine is a singleton and two suites would interleave on it.
    const runningRef = useRef(false)
    const cancelRef = useRef<AbortController | null>(null)

    useEffect(() => {
        function status(detail: {
            state: 'idle' | 'loading-demo' | 'running' | 'done' | 'error'
            message?: string
            completed?: number
            total?: number
            dataset?: string
        }): void {
            devBus.emit('eval:status', detail)
        }

        async function loadDemo(): Promise<void> {
            const url = import.meta.env.PUBLIC_DEMO_JSON_URL
            if (!url) {
                status({
                    state: 'error',
                    message:
                        'PUBLIC_DEMO_JSON_URL is not set, so there is no demo dataset to load.',
                })
                return
            }
            status({ state: 'loading-demo', message: 'Loading demo data…' })
            try {
                const { insertUrlInDatabase } =
                    await import('../../db/queries/insertUrlInDatabase')
                await insertUrlInDatabase(new URL(url), (stage, percent) =>
                    status({
                        state: 'loading-demo',
                        message: `${stage} ${percent}%`,
                    })
                )
                const fingerprint = await datasetFingerprint()
                status({
                    state: 'idle',
                    dataset: describeFingerprint(fingerprint),
                })
            } catch (error) {
                status({
                    state: 'error',
                    message: `Could not load the demo dataset: ${error instanceof Error ? error.message : String(error)}`,
                })
            }
        }

        async function runSuite(detail: {
            caseIds?: string[]
            includeChart: boolean
            includeNarrator: boolean
        }): Promise<void> {
            if (runningRef.current) return
            runningRef.current = true
            const controller = new AbortController()
            cancelRef.current = controller

            try {
                const storedConfig = getStoredConfig()
                if (!storedConfig) {
                    status({
                        state: 'error',
                        message:
                            'Enable the assistant in the Chat tab first — the eval runner uses the model you configured there.',
                    })
                    return
                }

                const fingerprint = await datasetFingerprint()
                if (fingerprint.id === NO_DATASET.id) {
                    status({
                        state: 'error',
                        message:
                            'No data loaded. Load the demo dataset, or import your own listening history, then run again.',
                    })
                    return
                }

                // Chart and narrator are off by default: they are config-driven
                // and their failures are quality drift, not correctness. Running
                // them triples the wall clock for a signal you only want when
                // you are specifically tuning those agents.
                const config: AssistantConfig = {
                    ...storedConfig,
                    chart: detail.includeChart ? 'llm' : 'infer',
                    narrative: detail.includeNarrator ? 'stream' : 'static',
                }

                const selected = detail.caseIds
                    ? CASE_REGISTRY.cases.filter((evalCase) =>
                          detail.caseIds?.includes(evalCase.id)
                      )
                    : CASE_REGISTRY.cases

                status({
                    state: 'running',
                    completed: 0,
                    total: selected.length,
                    dataset: describeFingerprint(fingerprint),
                })

                const [
                    { getEngine },
                    { runAssistantTurn },
                    { createTurnTracer },
                ] = await Promise.all([
                    import('../../llm/engine'),
                    import('../../llm/runAssistantTurn'),
                    import('../../llm/tracing'),
                ])

                const engine = await getEngine(config.modelId)
                const results: CaseResult[] = []

                for (const [index, evalCase] of selected.entries()) {
                    if (controller.signal.aborted) break

                    const result = await runOne(
                        evalCase,
                        engine,
                        config,
                        controller.signal,
                        runAssistantTurn,
                        createTurnTracer
                    )
                    results.push(result.score)
                    devBus.emit('eval:case', {
                        result: result.score,
                        spans: result.spans,
                    })
                    status({
                        state: 'running',
                        completed: index + 1,
                        total: selected.length,
                        dataset: describeFingerprint(fingerprint),
                    })
                }

                const run: EvalRun = {
                    // Stamped here rather than inside the store, so that module
                    // stays pure and testable without faking a clock.
                    startedAt: Date.now(),
                    context: {
                        modelId: config.modelId,
                        chartMode: config.chart,
                        narrativeMode: config.narrative,
                        datasetId: fingerprint.id,
                    },
                    score: scoreSuite(results),
                    results,
                }
                saveRun(run)
                devBus.emit('eval:done', { run })
                status({
                    state: 'done',
                    completed: results.length,
                    total: selected.length,
                    dataset: describeFingerprint(fingerprint),
                })
            } catch (error) {
                status({
                    state: 'error',
                    message:
                        error instanceof Error ? error.message : String(error),
                })
            } finally {
                runningRef.current = false
                cancelRef.current = null
            }
        }

        const offRun = devBus.on('eval:run', (detail) => {
            void runSuite(detail)
        })
        const offCancel = devBus.on('eval:cancel', () => {
            cancelRef.current?.abort()
        })
        const offLoadDemo = devBus.on('eval:load-demo', () => {
            void loadDemo()
        })

        // Tell the toolbar what it is looking at as soon as it can listen.
        void datasetFingerprint().then((fingerprint) =>
            status({ state: 'idle', dataset: describeFingerprint(fingerprint) })
        )

        return () => {
            offRun()
            offCancel()
            offLoadDemo()
            cancelRef.current?.abort()
        }
    }, [])

    return null
}

/**
 * Runs one case and scores it.
 *
 * The spans are captured per case rather than read from the shared tracer, so a
 * result carries exactly the spans of its own turn — which is what lets a failing
 * case expand into its trace in place.
 */
async function runOne(
    evalCase: EvalCase,
    engine: Parameters<
        typeof import('../../llm/runAssistantTurn').runAssistantTurn
    >[0],
    config: AssistantConfig,
    signal: AbortSignal,
    runAssistantTurn: typeof import('../../llm/runAssistantTurn').runAssistantTurn,
    createTurnTracer: typeof import('../../llm/tracing').createTurnTracer
) {
    const tracer = createTurnTracer({
        question: evalCase.question,
        attributes: { 'tracksy.eval_case': evalCase.id },
    })

    const result = await runAssistantTurn(
        engine,
        config,
        evalCase.question,
        [],
        signal,
        tracer
    )
    tracer.end({ status: result.payload.kind === 'ok' ? 'ok' : 'error' })

    const spans = tracer.spans()
    return { score: scoreCase(evalCase, result, spans), spans }
}
