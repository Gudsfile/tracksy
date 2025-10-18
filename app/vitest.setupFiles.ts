import { cleanup } from '@testing-library/react'

import { afterEach, beforeEach } from 'vitest'

import { DataTransferMock } from './src/fixtures/DataTransferMock'

beforeEach(() => {
    // @ts-expect-error DataTransfer is not defined in jsdom
    global.DataTransfer = DataTransferMock

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
})

afterEach(() => {
    cleanup()
})
