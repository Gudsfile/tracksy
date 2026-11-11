import {
    createTracer,
    withTracing,
    type RunRecord,
    type Tracer,
} from 'webllm-otel'
import { devBus } from '../devToolbar/devBus'
import type { TraceAttributes, TurnSpanKind, TurnTracer } from './tracingTypes'

/**
 * The single seam between Tracksy and `webllm-otel`.
 *
 * This is the only module in the app with a *runtime* import of the library.
 * Everything else depends on the local `TurnTracer` interface via `import type`,
 * so it erases at compile time. Reaching this module goes through
 * `if (import.meta.env.DEV) await import('./tracing')`, which Vite resolves to
 * `if (false)` in a production build — Rollup then drops the branch, the dynamic
 * import, and the library along with it. `moon run app:assert-no-dev-code` fails
 * the build if that ever stops being true.
 */

const MAX_RUNS = 25

let tracer: Tracer | null = null

function getTracer(): Tracer {
    tracer ??= createTracer({
        maxRuns: MAX_RUNS,
        // Prompts and completions are the point: without them a failing eval
        // case shows *that* it failed and never *why*. This is dev-only code and
        // the data never leaves the browser unless the Langfuse export is
        // explicitly configured.
        captureContent: true,
        onSpanEnd: (span) => devBus.emit('agent:span', { span }),
    })
    return tracer
}

export type TurnMeta = {
    question: string
    attributes?: TraceAttributes
}

/**
 * Opens a traced turn and returns the facade the pipeline is written against.
 *
 * The returned object hides `webllm-otel` entirely, which is what lets
 * `runAssistantTurn` stay free of any runtime reference to it.
 */
export function createTurnTracer(meta: TurnMeta): TurnTracer {
    const run = getTracer().startRun({
        name: 'assistant-turn',
        kind: 'turn',
        attributes: { 'tracksy.question': meta.question, ...meta.attributes },
    })

    return {
        span(kind: TurnSpanKind, name: string, attributes?: TraceAttributes) {
            return run.startSpan({
                name,
                kind,
                ...(attributes && { attributes }),
            })
        },
        wrapEngine<E>(engine: E, kind: TurnSpanKind): E {
            // The cast is the price of keeping `EngineLike` out of the app's
            // types: the pipeline passes an `MLCEngineInterface`, which
            // structurally satisfies the library but is not declared as such.
            return withTracing(engine as never, run, { kind }) as E
        },
        end(options) {
            run.end(options)
        },
        spans() {
            // A copy: the record keeps mutating as deferred callbacks add spans,
            // and a caller holding a live array would see it change underneath.
            return [...run.record.spans]
        },
    }
}

/** Every retained run, newest last. Read by the dev toolbar. */
export function getTracedRuns(): RunRecord[] {
    return getTracer().getRuns()
}

export function clearTracedRuns(): void {
    getTracer().clear()
}
