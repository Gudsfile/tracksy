// @ts-check
import { defineConfig } from 'astro/config'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

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

// https://astro.build/config
export default defineConfig({
    site: 'https://gudsfile.github.io',
    base: process.env.BASE_PATH || '/tracksy',
    trailingSlash: 'never',
    output: 'static',
    vite: {
        plugins: [
            // https://github.com/nika-begiashvili/libarchivejs/blob/0989c1a6db20d030d793b1763e20d880068091bd/examples/esbuild/build.mjs#L14
            // @ts-ignore
            // Could be removed when Astro will upgrade its Vite dependency version 7.x
            viteStaticCopy({
                targets: [
                    {
                        src: 'node_modules/libarchive.js/dist/libarchive.wasm',
                        dest: './_astro/',
                    },
                ],
            }),
            tailwindcss(),
        ],
        build: {
            rollupOptions: {
                external: DUCKDB_EXTERNALS,
            },
        },
        optimizeDeps: {
            exclude: DUCKDB_EXTERNALS,
        },
        ssr: {
            external: DUCKDB_EXTERNALS,
        },
    },
    integrations: [...(process.env.VITEST ? [] : [react()])],
})
