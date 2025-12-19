/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />

declare module '*.sql?raw' {
    const content: string
    // eslint-disable-next-line import/no-default-export
    export default content
}
