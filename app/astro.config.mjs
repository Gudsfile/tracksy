// @ts-check
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { tracksyDevToolbar } from './src/devToolbar/integration.ts'
import {
    isRemoteHost,
    redactSpanContent,
} from './src/devToolbar/redactSpanContent.ts'

// @duckdb/node-api (devDependency used for tests) ships platform-specific native binaries
// that Rollup/Vite cannot bundle. We mark them as external so they are resolved at runtime
// instead of being processed by the bundler.
// https://github.com/duckdb/duckdb-node-neo/issues/231#issuecomment-3544875108
const DUCKDB_EXTERNALS = [
    '@duckdb/node-api',
    '@duckdb/node-bindings',
    '@duckdb/node-bindings-win32-x64',
    '@duckdb/node-bindings-linux-x64',
    '@duckdb/node-bindings-linux-arm64',
    '@duckdb/node-bindings-darwin-x64',
    '@duckdb/node-bindings-darwin-arm64',
]

// As of @duckdb/duckdb-wasm 1.32.0, the browser workers ship inline sourcemaps that
// reference .ts files living outside the package (an upstream packaging issue in the
// bundled @duckdb/apache-arrow sources), and one worker's .worker.js.map is missing
// entirely. When Vite serves those workers in dev this produces a flood of "Sourcemap ...
// points to a source file outside its package" warnings plus a "Failed to load source
// map ... ENOENT" warning on every start.
// We intercept the load of those worker files, strip the inline `//# sourceMappingURL=`
// comment, and hand back an empty sourcemap. Because Vite then extracts the (now absent)
// sourcemap from the already-stripped content, both warning classes disappear. Using a
// `load` hook (rather than `transform`) is required to also suppress the ENOENT warning,
// which is emitted during the load phase before any transform runs.
// We must leave the `?url` import (`import worker from '...worker.js?url'` in setupDB)
// to Vite: that request expects a URL string module, not the worker source, so returning
// code for it would corrupt worker instantiation. The sourcemap warnings are emitted for
// the bare worker-file loads, which we still intercept.
// This is a TEMPORARY workaround for an upstream packaging issue and can be removed once
// upstream ships correct sourcemaps.
function duckdbWasmWorkerSourcemapFix() {
    return {
        name: 'duckdb-wasm-worker-sourcemap-fix',
        apply: 'serve',
        enforce: 'pre',
        /**
         * @param {string} id
         */
        async load(id) {
            const [path, query] = id.split('?')
            if (
                query === 'url' ||
                !/@duckdb\/duckdb-wasm\/dist\/[^/]*\.worker\.js$/.test(path)
            ) {
                return
            }
            const code = await readFile(path, 'utf8')
            return {
                code: code.replace(/\n?\/\/# sourceMappingURL=[^\n]*/g, ''),
                map: { mappings: '' },
            }
        },
    }
}

// Optional Langfuse export, dev only and inert unless configured.
//
// Langfuse authenticates OTLP with Basic auth derived from the SECRET key, which
// must never reach a browser — and `@langfuse/browser` only does score ingestion,
// not tracing, so there is no client-side path that would avoid this. The proxy
// exists so the browser can POST spans to a same-origin URL while the credential
// stays in the dev server.
//
// The variables are deliberately NOT prefixed `PUBLIC_`: Astro inlines those into
// client code, which is exactly the mistake this guards against.
//
// The target is Langfuse Cloud, which changes one thing that matters: exported
// traces leave the machine. `askNarrator` embeds listening-history samples
// directly in its prompt, and spans capture `gen_ai.prompt`/`gen_ai.completion`
// by design, so the proxy strips those two attributes whenever the configured
// host isn't local — the policy lives here, with the credential, rather than in
// the client, so nothing that POSTs to this endpoint can opt itself out of it.
const LANGFUSE_PATH = '/__langfuse'

function langfuseProxy() {
    /** @type {Record<string, string>} */
    let env = {}

    return {
        name: 'langfuse-otlp-proxy',
        // `serve` only: this middleware never becomes part of a build.
        apply: 'serve',
        /** @param {import('vite').ResolvedConfig} config */
        configResolved(config) {
            // `loadEnv` with an empty prefix reads unprefixed variables from
            // .env files, which `process.env` alone would not surface.
            env = loadEnv(config.mode, process.cwd(), '')
        },
        /** @param {import('vite').ViteDevServer} server */
        configureServer(server) {
            const baseUrl = () =>
                (env.LANGFUSE_BASE_URL ?? process.env.LANGFUSE_BASE_URL ?? '')
                    .trim()
                    .replace(/\/$/, '')
            const publicKey = () =>
                env.LANGFUSE_PUBLIC_KEY ?? process.env.LANGFUSE_PUBLIC_KEY ?? ''
            const secretKey = () =>
                env.LANGFUSE_SECRET_KEY ?? process.env.LANGFUSE_SECRET_KEY ?? ''
            const configured = () =>
                Boolean(baseUrl() && publicKey() && secretKey())
            const remote = () => isRemoteHost(baseUrl())
            /**
             * Tri-state: unset auto-strips iff the target is remote (the safe
             * default), `'true'`/`'false'` force the behaviour either way.
             * Kept tri-state specifically so redaction is testable against the
             * localhost stub — with auto-only, stripping could never be
             * exercised locally, and an untested redaction path is exactly
             * the one that fails quietly.
             */
            const exportContentSetting = () =>
                (
                    env.LANGFUSE_EXPORT_CONTENT ??
                    process.env.LANGFUSE_EXPORT_CONTENT ??
                    ''
                )
                    .trim()
                    .toLowerCase()
            const contentStripped = () => {
                const setting = exportContentSetting()
                if (setting === 'true') return false
                if (setting === 'false') return true
                return remote()
            }

            server.middlewares.use(
                /**
                 * @param {import('node:http').IncomingMessage} req
                 * @param {import('node:http').ServerResponse} res
                 * @param {() => void} next
                 */
                (req, res, next) => {
                    const url = req.url ?? ''
                    if (!url.includes(LANGFUSE_PATH)) return next()

                    if (url.includes(`${LANGFUSE_PATH}/status`)) {
                        res.setHeader('content-type', 'application/json')
                        // The host is safe to reveal to the toolbar; the keys are not.
                        res.end(
                            JSON.stringify({
                                configured: configured(),
                                baseUrl: baseUrl() || undefined,
                                remote: remote(),
                                contentStripped: contentStripped(),
                            })
                        )
                        return
                    }

                    if (!url.includes(`${LANGFUSE_PATH}/v1/traces`))
                        return next()

                    if (!configured()) {
                        res.statusCode = 501
                        res.setHeader('content-type', 'application/json')
                        res.end(
                            JSON.stringify({
                                error: 'Langfuse export is not configured. Set LANGFUSE_BASE_URL, LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY (no PUBLIC_ prefix).',
                            })
                        )
                        return
                    }

                    /** @type {Buffer[]} */
                    const chunks = []
                    req.on('data', (chunk) => chunks.push(chunk))
                    req.on('end', async () => {
                        try {
                            const auth = Buffer.from(
                                `${publicKey()}:${secretKey()}`
                            ).toString('base64')
                            // Redaction is applied here, not in the client: a
                            // bug in the classifier costs one export, never a
                            // stray prompt on Cloud. A payload that doesn't
                            // parse as JSON is forwarded as-is — an unparsable
                            // body is not a redaction concern, it's an
                            // upstream 4xx waiting to happen.
                            let body = Buffer.concat(chunks)
                            if (contentStripped()) {
                                try {
                                    const redacted = redactSpanContent(
                                        JSON.parse(body.toString('utf8'))
                                    )
                                    body = Buffer.from(JSON.stringify(redacted))
                                } catch {
                                    // Not valid JSON — pass it through and let
                                    // upstream reject it.
                                }
                            }
                            const upstream = await fetch(
                                `${baseUrl()}/api/public/otel/v1/traces`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'content-type': 'application/json',
                                        authorization: `Basic ${auth}`,
                                        'x-langfuse-ingestion-version': '4',
                                    },
                                    body,
                                }
                            )
                            res.statusCode = upstream.status
                            res.setHeader('content-type', 'application/json')
                            res.end(await upstream.text())
                        } catch (error) {
                            res.statusCode = 502
                            res.setHeader('content-type', 'application/json')
                            res.end(
                                JSON.stringify({
                                    error: `Could not reach Langfuse at ${baseUrl()}: ${error instanceof Error ? error.message : String(error)}`,
                                })
                            )
                        }
                    })
                }
            )
        },
    }
}

// The dev event bus is instrumentation: it must not exist in a production build.
// A runtime `import.meta.env.DEV` guard is not enough — `devBus.emit` is called
// from modules that DO ship (askLLM, engine, queryDB, StreamProvider), so a static
// import pulls the real implementation into the bundle regardless of whether the
// guard ever lets it run. `moon run app:assert-no-dev-code` fails the build when
// that happens.
//
// Redirecting the specifier at build time gives production a set of empty
// functions instead, while every call site stays a plain synchronous import.
function stripDevBusInProduction() {
    const noop = fileURLToPath(
        new URL('./src/devToolbar/devBus.noop.ts', import.meta.url)
    )
    return {
        name: 'strip-dev-bus-in-production',
        apply: 'build',
        enforce: 'pre',
        /**
         * @param {string} source
         */
        resolveId(source) {
            // Only the bare module specifier, never the noop itself — matching
            // that would resolve the file to itself and loop.
            return /(^|\/)devToolbar\/devBus(\.ts)?$/.test(source)
                ? noop
                : undefined
        },
    }
}

// https://astro.build/config
export default defineConfig({
    site: 'https://gudsfile.github.io',
    // Deploy base path (see app/.env.example). Defaults to "/tracksy" when BASE_PATH is unset.
    base: process.env.BASE_PATH || '/tracksy',
    trailingSlash: 'never',
    output: 'static',
    vite: {
        plugins: [
            duckdbWasmWorkerSourcemapFix(),
            stripDevBusInProduction(),
            langfuseProxy(),
            // https://github.com/nika-begiashvili/libarchivejs/blob/0989c1a6db20d030d793b1763e20d880068091bd/examples/esbuild/build.mjs#L14
            // @ts-ignore
            // Could be removed when Astro will upgrade its Vite dependency version 7.x
            viteStaticCopy({
                targets: [
                    {
                        src: 'node_modules/libarchive.js/dist/libarchive.wasm',
                        dest: './_astro/',
                        rename: { stripBase: true },
                    },
                ],
            }),
            tailwindcss(),
        ],
        build: {
            rollupOptions: {
                external: DUCKDB_EXTERNALS,
                output: {
                    // Keep the light assistant config/device modules in their
                    // own chunk so they can never be folded into the ~5.7 MB
                    // web-llm `engine` chunk — which would pull it eagerly when
                    // the Chat tab opens instead of on "Enable assistant".
                    manualChunks(id) {
                        if (
                            id.includes('src/llm/assistantConfig') ||
                            id.includes('src/llm/deviceDetection') ||
                            id.includes('src/llm/modelState')
                        ) {
                            return 'assistant-config'
                        }
                    },
                },
            },
        },
        optimizeDeps: {
            exclude: DUCKDB_EXTERNALS,
        },
        ssr: {
            external: DUCKDB_EXTERNALS,
        },
    },
    integrations: [
        ...(process.env.VITEST ? [] : [react(), tracksyDevToolbar()]),
    ],
})
