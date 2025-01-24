// @ts-check
import { defineConfig } from 'astro/config'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import tailwind from '@astrojs/tailwind'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [
            // https://github.com/nika-begiashvili/libarchivejs/blob/0989c1a6db20d030d793b1763e20d880068091bd/examples/esbuild/build.mjs#L14
            viteStaticCopy({
                targets: [
                    {
                        src: 'node_modules/libarchive.js/dist/libarchive.wasm',
                        dest: './_astro/',
                    },
                ],
            }),
        ],
    },
    integrations: [tailwind(), react()],
})
