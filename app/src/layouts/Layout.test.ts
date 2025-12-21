// https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1713026327
// @vitest-environment node

import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, it } from 'vitest'

import Layout from './Layout.astro'

it('renders with the provided title', async () => {
    const container = await AstroContainer.create()
    const result = await container.renderToString(Layout, {
        props: { title: 'Test Title' },
    })

    expect(result).toContain('<title>Test Title</title>')
})

it('renders the slot content', async () => {
    const container = await AstroContainer.create()
    const result = await container.renderToString(Layout, {
        props: { title: 'Test Title' },
        slots: { default: '<div id="test-content">Main Content</div>' },
    })

    expect(result).toContain('<div id="test-content">Main Content</div>')
})

it('includes the theme initialization script', async () => {
    const container = await AstroContainer.create()
    const result = await container.renderToString(Layout, {
        props: { title: 'Test Title' },
    })

    // BASE_URL is empty in test environment, resulting in //src/scripts/...
    expect(result).toContain('src="//src/scripts/theme-init.js"')
})

it('sets the correct language attribute', async () => {
    const container = await AstroContainer.create()
    const result = await container.renderToString(Layout, {
        props: { title: 'Test Title' },
    })

    expect(result).toContain('<html lang="en">')
})
