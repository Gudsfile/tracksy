import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TopArtist } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () =>
        Promise.resolve([
            {
                artist_name: 'Test Artist',
                count_streams: 123,
                ms_played: 1000,
            },
        ]),
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopArtist Component', () => {
    it('should render the text', async () => {
        render(
            <ThemeProvider>
                <TopArtist />
            </ThemeProvider>
        )

        await waitFor(() => {
            screen.getByText('Test Artist 🏆')
            screen.getByText('most played artist')
            screen.getByText('For 123 streams in 1s')
        })
    })
})
