import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TracksyWrapper } from './TracksyWrapper'
import { getDB } from '../db/getDB'
import React from 'react'

vi.mock('./Dropzone/DropzoneWrapper', () => ({
    DropzoneWrapper: vi.fn(() => <div data-testid="dropzone-wrapper"></div>),
}))

vi.mock('./DemoButton/DemoButton', () => ({
    DemoButton: vi.fn(() => <div data-testid="demo-button"></div>),
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

    describe('when DB is initialized', () => {
        it('renders the Dropzone and DemoButton', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={false}
                />
            )
            await waitFor(() => expect(getDB).toHaveBeenCalled())
            screen.getByTestId('dropzone-wrapper')
            screen.getByTestId('demo-button')
            expect(screen.queryByTestId('spinner')).toBeNull()
            expect(screen.queryByTestId('charts')).toBeNull()
        })

        describe('when data is dropped', () => {
            it('renders Spinner', async () => {
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={true}
                        initialIsDataReady={false}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                expect(screen.queryByTestId('dropzone-wrapper')).toBeNull()
                expect(screen.queryByTestId('demo-button')).toBeNull()
                screen.getByTestId('spinner')
                expect(screen.queryByTestId('charts')).toBeNull()
            })
        })

        describe('when data is ready', () => {
            it('renders Dropzone and Charts', async () => {
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={false}
                        initialIsDataReady={true}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                screen.getByTestId('dropzone-wrapper')
                expect(screen.queryByTestId('demo-button')).toBeNull()
                expect(screen.queryByTestId('spinner')).toBeNull()
                screen.queryByTestId('charts')
            })
        })

        describe('when data dropped and ready', () => {
            it('renders Charts and Dropzone', async () => {
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={true}
                        initialIsDataReady={true}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                screen.getByTestId('dropzone-wrapper')
                expect(screen.queryByTestId('demo-button')).toBeNull()
                expect(screen.queryByTestId('spinner')).toBeNull()
                screen.getByTestId('charts')
            })
        })
    })

    describe('when DB is not initialized', () => {
        it('does not render the DataButton', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={false}
                />
            )
            expect(screen.queryByTestId('data-button')).toBeNull()
        })
    })

    describe('when data is dropped', () => {
        it('does not render the DataButton', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={true}
                    initialIsDataReady={false}
                />
            )
            await waitFor(() => expect(getDB).toHaveBeenCalled())
            expect(screen.queryByTestId('data-button')).toBeNull()
        })
    })

    describe('when data is ready', () => {
        it('does not render the DataButton', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={true}
                />
            )
            await waitFor(() => expect(getDB).toHaveBeenCalled())
            expect(screen.queryByTestId('data-button')).toBeNull()
        })
    })

    describe('when data is ready and data is dropped', () => {
        it('does not render the DataButton', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={true}
                    initialIsDataReady={true}
                />
            )
            await waitFor(() => expect(getDB).toHaveBeenCalled())
            expect(screen.queryByTestId('data-button')).toBeNull()
        })
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
