import { cleanup } from '@testing-library/react'

import { afterEach, beforeEach } from 'vitest'

import { DataTransferMock } from './src/fixtures/DataTransferMock'

beforeEach(() => {
    // @ts-expect-error DataTransfer is not defined in jsdom
    global.DataTransfer = DataTransferMock

    // HACK: Astro can compile component in multiple envs (browser & server), To be able to tests `*.astro` files we need executed them in node environment (server) where window doesn't exist
    if (typeof window !== 'undefined') {
        // Mock window.matchMedia for theme tests
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: (query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: () => {},
                removeEventListener: () => {},
                dispatchEvent: () => true,
            }),
        })
    }
})

afterEach(() => {
    cleanup()
})
