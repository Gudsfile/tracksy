import { describe, it, expect, vi } from 'vitest'
import { tracksyDevToolbar } from './integration'

type ToolbarApp = {
    id: string
    name: string
    entrypoint: string | URL
    icon: string
}

function setup(command: string) {
    const addDevToolbarApp = vi.fn()
    const integration = tracksyDevToolbar()
    const hook = integration.hooks['astro:config:setup']
    // The hook takes the full Astro setup context; only these two are used.
    hook?.({ addDevToolbarApp, command } as never)
    return {
        apps: addDevToolbarApp.mock.calls.map(([app]) => app as ToolbarApp),
    }
}

describe('tracksyDevToolbar', () => {
    it('registers both apps when serving', () => {
        const { apps } = setup('dev')

        expect(apps.map((app) => app.id)).toEqual(['tracksy', 'tracksy-llm'])
        expect(apps.map((app) => app.name)).toEqual([
            'Tracksy DevTools',
            'Tracksy LLM',
        ])
    })

    it('points each app at its own entrypoint', () => {
        const { apps } = setup('dev')

        // Passed as a `URL`, which `addDevToolbarApp` accepts directly —
        // converting to a path with `fileURLToPath` would only work where
        // `import.meta.url` is a file URL, which is not true under Vite.
        expect(String(apps[0]?.entrypoint)).toMatch(/tracksyToolbar\.ts$/)
        expect(String(apps[1]?.entrypoint)).toMatch(/tracksyLlmToolbar\.ts$/)
    })

    it('gives the apps distinct icons so they are tellable apart in the bar', () => {
        const { apps } = setup('dev')

        expect(apps[0]?.icon).not.toBe(apps[1]?.icon)
    })

    for (const command of ['build', 'preview', 'sync']) {
        it(`registers nothing for the ${command} command`, () => {
            // These apps reach tracing and eval code that must never be part of
            // a build. `assert-no-dev-code` is the backstop; this is the lock.
            expect(setup(command).apps).toEqual([])
        })
    }
})
