import { cleanup } from '@testing-library/react'

import { afterEach, beforeEach } from 'vitest'

import { DataTransferMock } from './src/test-utils/DataTransferMock'

beforeEach(() => {
    // @ts-expect-error DataTransfer is not defined in jsdom
    global.DataTransfer = DataTransferMock
})

afterEach(() => {
    cleanup()
})
