import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TracksyWrapper } from './TracksyWrapper'
import { getDB } from '../db/getDB'
import React from 'react'

vi.mock('./Dropzone/DropzoneWrapper', () => ({
    DropzoneWrapper: vi.fn(() => <div data-testid="dropzone-wrapper"></div>),
}))

vi.mock('./Spinner/Spinner', () => ({
    Spinner: vi.fn(() => <div data-testid="spinner"></div>),
}))

vi.mock('./Charts/Charts', () => ({
    Charts: vi.fn(() => <div data-testid="charts"></div>),
}))

vi.mock('../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

vi.mock('../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TracksyWrapper', () => {
    it('renders Dropzone when DB is initialized', async () => {
        render(
            <TracksyWrapper
                initialDb={{}}
                initialIsDataDropped={false}
                initialIsDataReady={false}
            />
        )
        await waitFor(() => expect(getDB).toHaveBeenCalled())
        expect(screen.getByTestId('dropzone-wrapper'))
    })

    it('renders Spinner when files are dropped but not ready', async () => {
        render(
            <TracksyWrapper
                initialDb={{}}
                initialIsDataDropped={true}
                initialIsDataReady={false}
            />
        )
        expect(screen.getByTestId('spinner'))
    })

    it('renders Charts and Dropzone when files are processed', async () => {
        render(
            <TracksyWrapper
                initialDb={{}}
                initialIsDataDropped={true}
                initialIsDataReady={true}
            />
        )
        expect(screen.getByTestId('dropzone-wrapper'))
        expect(screen.getByTestId('charts'))
    })
})
