/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare module '*.astro' {
    import { Component } from 'astro'
    const component: Component
    // eslint-disable-next-line import/no-default-export
    export default component
}
