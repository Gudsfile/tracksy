// @ts-check
import { readFile } from 'node:fs/promises'
import { defineConfig } from 'astro/config'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { tracksyDevToolbar } from './src/devToolbar/integration.ts'

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

// https://astro.build/config
export default defineConfig({
    site: 'https://gudsfile.github.io',
    base: process.env.BASE_PATH || '/tracksy',
    trailingSlash: 'never',
    output: 'static',
    vite: {
        plugins: [
            duckdbWasmWorkerSourcemapFix(),
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
