/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    /** URL of the demo streaming-history JSON loaded by the "Try demo" flow. */
    readonly PUBLIC_DEMO_JSON_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module '*.astro' {
    import { Component } from 'astro'
    const component: Component
    // eslint-disable-next-line import/no-default-export
    export default component
}

declare module '*.sql?raw' {
    const content: string
    // eslint-disable-next-line import/no-default-export
    export default content
}
