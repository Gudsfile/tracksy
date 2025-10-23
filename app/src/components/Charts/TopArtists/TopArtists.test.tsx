import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TopArtists } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () => () => [
        {
            artist_name: 'artist_a',
            count_streams: 10n,
            ms_played: 0n,
        },
    ],
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopArtists Component', () => {
    it('should render the svg', async () => {
        const { container } = render(
            <ThemeProvider>
                <TopArtists year={2006} />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Top Artists')
        screen.getByText('artist_a')
    })
})
