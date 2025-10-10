import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TopTracks } from '.'
import { ThemeProvider } from '../../../hooks/ThemeContext'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () => () => [
        {
            track_name: 'track_a',
            artist_name: 'artist_b',
            count_streams: 10n,
            ms_played: 0n,
        },
    ],
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopTracks Component', () => {
    it('should render the svg', async () => {
        const { container } = render(
            <ThemeProvider>
                <TopTracks year={2006} />
            </ThemeProvider>
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Top Tracks')
        screen.getByText('track_a — artist_b')
    })
})
