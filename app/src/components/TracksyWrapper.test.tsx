import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TracksyWrapper } from './TracksyWrapper'
import { getDB } from '../db/getDB'

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

describe('TracksyWrapper', () => {
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
        it('renders nothing', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={false}
                />
            )
            expect(document.body.innerHTML).toBe('<div></div>')
        })
    })
})
