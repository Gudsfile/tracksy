import type { devBus as DevBus } from './devBus'

/**
 * Production stand-in for {@link DevBus}.
 *
 * `devBus.emit` already returns early when `import.meta.env.DEV` is false, but a
 * runtime guard does not remove the module: the emitters live in shipped code
 * (`askLLM`, `engine`, `queryDB`, `StreamProvider`), so a static import drags the
 * real implementation into the production bundle where it sits as dead weight.
 *
 * The `strip-dev-bus-in-production` Vite plugin in `astro.config.mjs` redirects
 * every `devToolbar/devBus` import here during `astro build`, so production gets
 * these empty functions and the dev implementation is never reached.
 *
 * Typing this as `typeof DevBus` is deliberate: if the real bus grows a method or
 * changes a signature, this file stops compiling rather than silently drifting
 * out of sync and breaking the production build.
 */
export const devBus: typeof DevBus = {
    emit() {},
    on() {
        return () => {}
    },
}

export type { DevBusEventMap } from './devBus'
