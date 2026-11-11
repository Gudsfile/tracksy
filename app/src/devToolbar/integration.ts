import type { AstroIntegration } from 'astro'

const RUNTIME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <rect x="2" y="14" width="4" height="8" rx="1"/>
  <rect x="9" y="9" width="4" height="13" rx="1"/>
  <rect x="16" y="4" width="4" height="18" rx="1"/>
</svg>`

const LLM_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="5" cy="6" r="2"/>
  <circle cx="5" cy="18" r="2"/>
  <circle cx="19" cy="12" r="2"/>
  <path d="M7 6h5a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2"/>
  <path d="M7 18h5a2 2 0 0 0 2-2v-2a2 2 0 0 1 2-2"/>
</svg>`

// Each entrypoint is spelled out inline rather than built by a helper: a
// computed specifier is opaque to static analysis, and `knip` then reports the
// toolbar entrypoints as unreachable files.
export function tracksyDevToolbar(): AstroIntegration {
    return {
        name: 'tracksy-dev-toolbar',
        hooks: {
            'astro:config:setup': ({ addDevToolbarApp, command }) => {
                // The toolbar only exists while serving, and these apps pull in
                // tracing and eval code that must never be reachable from a
                // build. Registering unconditionally happened to be harmless,
                // but it left the door open — `moon run app:assert-no-dev-code`
                // is the wall; this is the lock.
                if (command !== 'dev') return

                addDevToolbarApp({
                    id: 'tracksy',
                    name: 'Tracksy DevTools',
                    icon: RUNTIME_ICON,
                    entrypoint: new URL('./tracksyToolbar.ts', import.meta.url),
                })

                // Split by domain: this app owns everything about the assistant
                // — live traces now, evals next — so a failing eval case can
                // expand straight into its spans without crossing windows.
                addDevToolbarApp({
                    id: 'tracksy-llm',
                    name: 'Tracksy LLM',
                    icon: LLM_ICON,
                    entrypoint: new URL(
                        './tracksyLlmToolbar.ts',
                        import.meta.url
                    ),
                })
            },
        },
    }
}
