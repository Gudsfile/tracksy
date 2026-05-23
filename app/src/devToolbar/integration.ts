import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <rect x="2" y="14" width="4" height="8" rx="1"/>
  <rect x="9" y="9" width="4" height="13" rx="1"/>
  <rect x="16" y="4" width="4" height="18" rx="1"/>
</svg>`

export function tracksyDevToolbar(): AstroIntegration {
    return {
        name: 'tracksy-dev-toolbar',
        hooks: {
            'astro:config:setup': ({ addDevToolbarApp }) => {
                addDevToolbarApp({
                    id: 'tracksy',
                    name: 'Tracksy DevTools',
                    icon: ICON,
                    entrypoint: fileURLToPath(
                        new URL('./tracksyToolbar.ts', import.meta.url)
                    ),
                })
            },
        },
    }
}
