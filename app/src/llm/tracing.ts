import {
    createTracer,
    withTracing,
    type RunRecord,
    type SpanHandle,
    type Tracer,
} from 'webllm-otel'
import { devBus } from '../devToolbar/devBus'
import {
    OTEL_ATTR,
    TRACKSY_ATTR,
    type TraceAttributes,
    type TraceError,
    type TurnSpan,
    type TurnSpanKind,
    type TurnTracer,
} from './tracingTypes'

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
    /** The loaded model; names and labels every model-call span. */
    modelId?: string
    /** Groups turns into one conversation (or one eval run). */
    sessionId?: string
    environment?: 'dev' | 'eval'
    attributes?: TraceAttributes
}

function toTurnSpan(handle: SpanHandle): TurnSpan {
    return {
        id: handle.spanId,
        setAttributes: (attributes) => handle.setAttributes(attributes),
        end: (options) => handle.end(options),
    }
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
        attributes: {
            [TRACKSY_ATTR.QUESTION]: meta.question,
            [TRACKSY_ATTR.MODEL_ID]: meta.modelId,
            [OTEL_ATTR.SESSION_ID]: meta.sessionId,
            [OTEL_ATTR.ENVIRONMENT]: meta.environment ?? 'dev',
            ...meta.attributes,
        },
    })
    const root = run.record.spans[0]

    return {
        span(
            kind: TurnSpanKind,
            name: string,
            attributes?: TraceAttributes,
            parent?: TurnSpan
        ) {
            return toTurnSpan(
                run.startSpan({
                    name,
                    kind,
                    ...(parent && { parentSpanId: parent.id }),
                    ...(attributes && { attributes }),
                })
            )
        },
        wrapEngine<E>(engine: E, kind: TurnSpanKind, parent?: TurnSpan): E {
            // The cast is the price of keeping `EngineLike` out of the app's
            // types: the pipeline passes an `MLCEngineInterface`, which
            // structurally satisfies the library but is not declared as such.
            return withTracing(engine as never, run, {
                kind,
                ...(meta.modelId && { model: meta.modelId }),
                ...(parent && { parentSpanId: parent.id }),
            }) as E
        },
        end(options) {
            run.end(options)
        },
        setAttributes(attributes) {
            if (!root) return
            for (const [key, value] of Object.entries(attributes)) {
                if (value !== undefined) root.attributes[key] = value
            }
        },
        spans() {
            // A copy: the record keeps mutating as deferred callbacks add spans,
            // and a caller holding a live array would see it change underneath.
            return [...run.record.spans]
        },
    }
}

/**
 * Traces a model load that no turn is waiting on: the first load, or a switch
 * from the settings panel. Its own trace, so load time per model can be
 * charted apart from turn latency.
 */
export function traceModelLoad(meta: {
    modelId: string
    reason: 'initial' | 'switch'
    sessionId?: string
}): { end(error?: TraceError): void } {
    const run = getTracer().startRun({
        name: 'model-load',
        kind: 'model-load',
        attributes: {
            [TRACKSY_ATTR.MODEL_ID]: meta.modelId,
            [TRACKSY_ATTR.MODEL_LOAD_REASON]: meta.reason,
            [OTEL_ATTR.SESSION_ID]: meta.sessionId,
            [OTEL_ATTR.ENVIRONMENT]: 'dev',
        },
    })
    return {
        end(error) {
            run.end(error ? { error } : undefined)
        },
    }
}

/** Every retained run, newest last. Not read by the toolbar; kept for tests. */
export function getTracedRuns(): RunRecord[] {
    return getTracer().getRuns()
}

export function clearTracedRuns(): void {
    getTracer().clear()
}
