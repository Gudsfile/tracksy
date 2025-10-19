import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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

let mockIsDemoReady = false
let mockDemoJsonUrl: string | undefined = undefined

vi.mock('../hooks/useDemo', () => ({
    useDemo: vi.fn(() => ({
        isDemoReady: mockIsDemoReady,
        handleDemoButtonClick: vi.fn(),
        demoJsonUrl: mockDemoJsonUrl,
    })),
}))

beforeEach(() => {
    vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')
    mockIsDemoReady = false
    mockDemoJsonUrl = undefined
})

afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
})

const createAssertions = (testId: string) => ({
    is: {
        rendered: () => {
            screen.getByTestId(testId)
            return createAssertions(testId)
        },
        not: {
            rendered: () => {
                expect(screen.queryByTestId(testId)).toBeNull()
                return createAssertions(testId)
            },
        },
    },
})

const assert = {
    dropzone: createAssertions('dropzone-wrapper'),
    demoButton: createAssertions('demo-button'),
    spinner: createAssertions('spinner'),
    charts: createAssertions('charts'),
}

describe('TracksyWrapper', () => {
    describe('when DB is initialized', () => {
        it('renders the Dropzone only', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={false}
                />
            )
            await waitFor(() => expect(getDB).toHaveBeenCalled())
            assert.dropzone.is.rendered()
            assert.demoButton.is.not.rendered()
            assert.spinner.is.not.rendered()
            assert.charts.is.not.rendered()
        })

        describe('and the demo URL is valued', () => {
            it('renders the Dropzone and DemoButton', async () => {
                mockDemoJsonUrl = 'url'
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={false}
                        initialIsDataReady={false}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                assert.dropzone.is.rendered()
                assert.demoButton.is.rendered()
                assert.spinner.is.not.rendered()
                assert.charts.is.not.rendered()
            })
        })

        describe('when data is dropped', () => {
            it('renders the Spinner only', async () => {
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={true}
                        initialIsDataReady={false}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                assert.dropzone.is.not.rendered()
                assert.demoButton.is.not.rendered()
                assert.spinner.is.rendered()
                assert.charts.is.not.rendered()
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
                assert.dropzone.is.rendered()
                assert.demoButton.is.not.rendered()
                assert.spinner.is.not.rendered()
                assert.charts.is.rendered()
            })
        })

        describe('when demo is ready', () => {
            it('renders Dropzone and Charts', async () => {
                mockIsDemoReady = true
                mockDemoJsonUrl = 'https://example.com'
                render(
                    <TracksyWrapper
                        initialDb={undefined}
                        initialIsDataDropped={false}
                        initialIsDataReady={false}
                    />
                )
                await waitFor(() => expect(getDB).toHaveBeenCalled())
                assert.dropzone.is.rendered()
                assert.demoButton.is.not.rendered()
                assert.spinner.is.not.rendered()
                assert.charts.is.rendered()
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
                assert.dropzone.is.rendered()
                assert.demoButton.is.not.rendered()
                assert.spinner.is.not.rendered()
                assert.charts.is.rendered()
            })
        })
    })

    describe('when DB is not initialized', () => {
        it('renders initialization message', async () => {
            render(
                <TracksyWrapper
                    initialDb={undefined}
                    initialIsDataDropped={false}
                    initialIsDataReady={false}
                />
            )
            expect(document.body.innerHTML).toBe(
                '<div><p class="dark:text-white">Initializing the database engine (DuckDB-WASM)...</p></div>'
            )
        })
    })
})
