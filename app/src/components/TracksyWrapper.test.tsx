import { it, expect, vi, afterEach } from 'vitest'
import {
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { TracksyWrapper } from './TracksyWrapper'
import * as db from '../db/getDB'

afterEach(() => {
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
        /Drag and drop or click to upload your Spotify data files/
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

it("shouldn't render the 'how to' button if no URL is defined", async () => {
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

    expect(screen.queryByRole<HTMLAnchorElement>('button', { name: '↓' })).toBe(
        null
    )
})
