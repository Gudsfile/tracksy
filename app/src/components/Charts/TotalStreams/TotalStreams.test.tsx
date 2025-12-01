import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TotalStreams } from '.'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () =>
        Promise.resolve([
            {
                count_streams: 123,
                ms_played: 1000,
            },
        ]),
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TotalStreams Component', () => {
    it('should render the text', async () => {
        render(<TotalStreams />)

        await waitFor(() => {
            screen.getByText('1s')
            screen.getByText('⏳')
            screen.getByText('played duration')
            screen.getByText('For 123 streams')
        })
    })
})
