import { describe, expect, it, vi } from 'vitest'
import { GEN_AI, WEBLLM_OTEL } from './semconv.js'
import { createTracer, type Run } from './tracer.js'
import { withTracing, type EngineLike } from './tracedEngine.js'

function steppingClock(start = 1_700_000_000_000): () => number {
    let current = start
    return () => (current += 1)
}

function makeRun(overrides: { captureContent?: boolean } = {}): {
    run: Run
    tracer: ReturnType<typeof createTracer>
} {
    const tracer = createTracer({
        now: steppingClock(),
        ...(overrides.captureContent === undefined
            ? {}
            : { captureContent: overrides.captureContent }),
    })
    return { run: tracer.startRun({ name: 'turn' }), tracer }
}

/**
 * A stand-in for MLCEngine. It is a class with a private field on purpose: the
 * proxy must never become the `this` of a real method, or private-field access
 * throws — a failure that only shows up against genuine class instances.
 */
class FakeEngine {
    readonly #secret = 'intact'
    chat: EngineLike['chat']
    reloadCalls = 0

    constructor(create: (...args: never[]) => unknown) {
        this.chat = { completions: { create } }
    }

    reload(): string {
        this.reloadCalls += 1
        return this.#secret
    }
}

const COMPLETION = {
    model: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    usage: { prompt_tokens: 120, completion_tokens: 40 },
    choices: [
        {
            message: { content: '{"intent":"top_artists"}' },
            finish_reason: 'stop',
        },
    ],
}

describe('withTracing', () => {
    it('returns the engine untouched when the run is disabled', () => {
        const tracer = createTracer({ enabled: false })
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))

        expect(withTracing(engine, tracer.startRun(), { kind: 'router' })).toBe(
            engine
        )
    })

    it('returns the engine untouched when it exposes no create method', () => {
        const { run } = makeRun()

        // Instrumentation must never be the reason an app breaks. A stub, a
        // partially-initialised engine, or a future API change should cost you
        // tracing — not throw from inside the wrapper.
        for (const shape of [{}, { chat: {} }, { chat: { completions: {} } }]) {
            const engine = shape as unknown as EngineLike
            expect(() =>
                withTracing(engine, run, { kind: 'router' })
            ).not.toThrow()
            expect(withTracing(engine, run, { kind: 'router' })).toBe(engine)
        }
    })

    it('passes the completion through unchanged', async () => {
        const { run } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, { kind: 'router' })

        await expect(
            traced.chat.completions.create({ messages: [] } as never)
        ).resolves.toBe(COMPLETION)
    })

    it('records request and response as GenAI attributes', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, { kind: 'router' })

        await traced.chat.completions.create({
            messages: [{ role: 'user', content: 'top artists' }],
            temperature: 0.1,
            max_tokens: 512,
        } as never)

        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.kind).toBe('router')
        expect(span?.name).toBe('chat.completions.create')
        expect(span?.status).toBe('ok')
        expect(span?.attributes).toMatchObject({
            [GEN_AI.SYSTEM]: 'webllm',
            [GEN_AI.OPERATION_NAME]: 'chat',
            [GEN_AI.REQUEST_TEMPERATURE]: 0.1,
            [GEN_AI.REQUEST_MAX_TOKENS]: 512,
            [GEN_AI.RESPONSE_MODEL]: COMPLETION.model,
            [GEN_AI.USAGE_INPUT_TOKENS]: 120,
            [GEN_AI.USAGE_OUTPUT_TOKENS]: 40,
            [GEN_AI.RESPONSE_FINISH_REASONS]: 'stop',
            [GEN_AI.COMPLETION]: '{"intent":"top_artists"}',
            [WEBLLM_OTEL.SPAN_KIND]: 'router',
        })
        expect(span?.attributes[GEN_AI.PROMPT]).toContain('top artists')
    })

    it('omits prompt and completion when captureContent is off', async () => {
        const { run, tracer } = makeRun({ captureContent: false })
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, { kind: 'router' })

        await traced.chat.completions.create({
            messages: [{ role: 'user', content: 'secret question' }],
        } as never)

        const attributes = tracer.getRuns()[0]?.spans[1]?.attributes ?? {}
        expect(attributes[GEN_AI.PROMPT]).toBeUndefined()
        expect(attributes[GEN_AI.COMPLETION]).toBeUndefined()
        // Metadata is still recorded — only the content is withheld.
        expect(attributes[GEN_AI.USAGE_OUTPUT_TOKENS]).toBe(40)
    })

    it('records a rejected completion as an error span and rethrows', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() =>
            Promise.reject(new Error('WebGPU device lost'))
        )
        const traced = withTracing(engine, run, { kind: 'router' })

        await expect(
            traced.chat.completions.create({ messages: [] } as never)
        ).rejects.toThrow('WebGPU device lost')

        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.status).toBe('error')
        expect(span?.error?.message).toBe('WebGPU device lost')
    })

    it('records a synchronous throw', () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => {
            throw new Error('engine not loaded')
        })
        const traced = withTracing(engine, run, { kind: 'router' })

        expect(() =>
            traced.chat.completions.create({ messages: [] } as never)
        ).toThrow('engine not loaded')
        expect(tracer.getRuns()[0]?.spans[1]?.status).toBe('error')
    })

    it('applies caller-supplied attributes to every span', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, {
            kind: 'narrator',
            name: 'narrate',
            attributes: { 'app.feature': 'chat' },
        })

        await traced.chat.completions.create({ messages: [] } as never)

        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.name).toBe('narrate')
        expect(span?.attributes['app.feature']).toBe('chat')
    })

    it('keeps the engine transparent, including private-field methods', () => {
        const { run } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, { kind: 'router' })

        // Would throw "cannot read private member" if the proxy leaked through
        // as `this`.
        expect(traced.reload()).toBe('intact')
        expect(engine.reloadCalls).toBe(1)
    })
})

describe('withTracing over a stream', () => {
    async function* completionStream(): AsyncGenerator<unknown> {
        yield { model: 'm', choices: [{ delta: { content: 'Hello' } }] }
        yield { choices: [{ delta: { content: ' world' } }] }
        // Providers report cumulative totals on the final chunk.
        yield {
            choices: [{ delta: { content: '' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 10, completion_tokens: 7 },
        }
    }

    it('yields every chunk unchanged', async () => {
        const { run } = makeRun()
        const engine = new FakeEngine(() => completionStream())
        const traced = withTracing(engine, run, { kind: 'narrator' })

        const received = []
        for await (const chunk of (await traced.chat.completions.create({
            messages: [],
            stream: true,
        } as never)) as AsyncIterable<unknown>) {
            received.push(chunk)
        }

        expect(received).toHaveLength(3)
    })

    it('assigns usage from the final chunk rather than summing', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => completionStream())
        const traced = withTracing(engine, run, { kind: 'narrator' })

        for await (const _chunk of (await traced.chat.completions.create({
            messages: [],
            stream: true,
        } as never)) as AsyncIterable<unknown>) {
            void _chunk
        }

        const span = tracer.getRuns()[0]?.spans[1]
        // Summing per chunk is the classic mistake here and would give a
        // plausible-looking but inflated number.
        expect(span?.attributes[GEN_AI.USAGE_OUTPUT_TOKENS]).toBe(7)
        expect(span?.attributes[GEN_AI.USAGE_INPUT_TOKENS]).toBe(10)
        expect(span?.attributes[GEN_AI.COMPLETION]).toBe('Hello world')
        expect(span?.attributes[WEBLLM_OTEL.STREAMED]).toBe(true)
        expect(span?.status).toBe('ok')
    })

    it('closes the span when the consumer abandons the stream', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => completionStream())
        const traced = withTracing(engine, run, { kind: 'narrator' })

        for await (const _chunk of (await traced.chat.completions.create({
            messages: [],
            stream: true,
        } as never)) as AsyncIterable<unknown>) {
            void _chunk
            break
        }

        // An abandoned stream must not leave a span open forever.
        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.endTimeUnixNano).toBeDefined()
        expect(span?.attributes[GEN_AI.COMPLETION]).toBe('Hello')
    })

    it('records a mid-stream failure as an error span', async () => {
        const { run, tracer } = makeRun()
        async function* failing(): AsyncGenerator<unknown> {
            yield { choices: [{ delta: { content: 'part' } }] }
            throw new Error('decode failed')
        }
        const engine = new FakeEngine(() => failing())
        const traced = withTracing(engine, run, { kind: 'narrator' })

        await expect(async () => {
            for await (const _chunk of (await traced.chat.completions.create({
                messages: [],
                stream: true,
            } as never)) as AsyncIterable<unknown>) {
                void _chunk
            }
        }).rejects.toThrow('decode failed')

        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.status).toBe('error')
        expect(span?.error?.message).toBe('decode failed')
    })

    it('handles a promise that resolves to a stream', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(completionStream()))
        const traced = withTracing(engine, run, { kind: 'narrator' })

        const stream = (await traced.chat.completions.create({
            messages: [],
            stream: true,
        } as never)) as AsyncIterable<unknown>
        for await (const _chunk of stream) {
            void _chunk
        }

        expect(
            tracer.getRuns()[0]?.spans[1]?.attributes[GEN_AI.COMPLETION]
        ).toBe('Hello world')
    })

    it('does not serialise unserialisable prompts', async () => {
        const { run, tracer } = makeRun()
        const engine = new FakeEngine(() => Promise.resolve(COMPLETION))
        const traced = withTracing(engine, run, { kind: 'router' })

        const circular: Record<string, unknown> = {}
        circular['self'] = circular
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        await traced.chat.completions.create({ messages: circular } as never)

        // The inference call still succeeds; only the prompt attribute is lost.
        expect(
            tracer.getRuns()[0]?.spans[1]?.attributes[GEN_AI.PROMPT]
        ).toBeUndefined()
        expect(tracer.getRuns()[0]?.spans[1]?.status).toBe('ok')
        warn.mockRestore()
    })
})
