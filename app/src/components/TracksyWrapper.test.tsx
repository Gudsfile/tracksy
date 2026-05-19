import { it, expect, vi, beforeEach } from 'vitest'
import {
    render,
    screen,
    act,
    waitFor,
    waitForElementToBeRemoved,
    fireEvent,
} from '@testing-library/react'
import { TracksyWrapper } from './TracksyWrapper'
import * as db from '../db/getDB'
import * as insertQueries from '../db/queries/insertFilesInDatabase'
import * as streamProvider from '../streamProvider'
import * as isZipArchiveModule from '../utils/isZipArchive'

beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
})

it('should render initialization message when DB is not initialized', async () => {
    vi.spyOn(db, 'getDB').mockResolvedValue({
        db: vi.fn(),
        conn: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof db.getDB>>)

    render(
        <TracksyWrapper
            initialDb={undefined}
            initialIsDataDropped={false}
            initialIsDataReady={false}
        />
    )
    screen.getByText('Initializing the database engine (DuckDB-WASM)...')
})

it('should render the Dropzone and Buttons when DB is initialized', async () => {
    vi.spyOn(db, 'getDB').mockResolvedValue({
        db: vi.fn(),
        conn: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')

    render(
        <TracksyWrapper
            initialDb={undefined}
            initialIsDataDropped={false}
            initialIsDataReady={false}
        />
    )
    await waitForElementToBeRemoved(() =>
        screen.queryByText('Initializing the database engine (DuckDB-WASM)...')
    )

    screen.getByLabelText(
        /Drag and drop or click to upload your music streaming data/
    )
    expect(
        screen
            .getByRole<HTMLAnchorElement>('link', { name: '?' })
            .getAttribute('title')
    ).toEqual('How do I get my data?')
    expect(
        screen
            .getByRole<HTMLAnchorElement>('button', { name: '↓' })
            .getAttribute('title')
    ).toEqual('Load demo data')
})

it('should show error banner when insertFilesInDatabase rejects', async () => {
    vi.spyOn(db, 'getDB').mockResolvedValue({
        db: vi.fn(),
        conn: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    vi.spyOn(insertQueries, 'insertFilesInDatabase').mockRejectedValue(
        new Error('No valid stream records found')
    )
    vi.spyOn(streamProvider, 'isAllowedFileContentType').mockReturnValue(true)
    vi.spyOn(isZipArchiveModule, 'isZipArchive').mockReturnValue(false)

    render(
        <TracksyWrapper
            initialDb={undefined}
            initialIsDataDropped={false}
            initialIsDataReady={false}
        />
    )
    await waitForElementToBeRemoved(() =>
        screen.queryByText('Initializing the database engine (DuckDB-WASM)...')
    )

    const input = screen.getByLabelText('upload file')
    const file = new File(['{}'], 'test.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('No streaming export recognized.')
    // dismiss to clear the auto-dismiss timer
    await act(async () => {
        fireEvent.click(alert)
    })
})

it("shouldn't render the 'how to' button if no URL is defined", async () => {
    vi.stubEnv('PUBLIC_DEMO_JSON_URL', undefined)
    vi.spyOn(db, 'getDB').mockResolvedValue({
        db: vi.fn(),
        conn: vi.fn(),
    } as unknown as Awaited<ReturnType<typeof db.getDB>>)

    render(
        <TracksyWrapper
            initialDb={undefined}
            initialIsDataDropped={false}
            initialIsDataReady={false}
        />
    )

    await waitForElementToBeRemoved(() =>
        screen.queryByText('Initializing the database engine (DuckDB-WASM)...')
    )

    await waitFor(() =>
        expect(
            screen.queryByRole<HTMLAnchorElement>('button', { name: '↓' })
        ).toBe(null)
    )
})
