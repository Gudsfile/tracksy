import { describe, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { TopArtist } from '.'
import * as queries from './query'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: (query: string) => {
        if (query === queries.queryTopArtistByCount()) {
            return Promise.resolve([
                {
                    artist_name: 'TestArtistByCount',
                    count_streams: 1230,
                    ms_played: 1000,
                },
            ])
        }
        if (query === queries.queryTopArtistByDuration()) {
            return Promise.resolve([
                {
                    artist_name: 'TestArtistByDuration',
                    count_streams: 123,
                    ms_played: 10000,
                },
            ])
        }
        return Promise.resolve([])
    },
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('TopArtist Component', () => {
    it('should render the top artist by count by default', async () => {
        render(<TopArtist />)

        await waitFor(() => {
            screen.getByText('TestArtistByCount')
            screen.getByText('🏆')
            screen.getByText('most played artist')
            screen.getByText('With 1230 streams, i.e. 1s')
        })
    })

    it('should render the top artist by duration on click', async () => {
        render(<TopArtist />)

        await waitFor(() => {
            screen.getByText('TestArtistByCount')
            screen.getByText('🏆')
            screen.getByText('most played artist')
            screen.getByText('With 1230 streams, i.e. 1s')
        })

        const button = screen.getByRole('button')

        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('TestArtistByDuration')
            screen.getByText('🏆')
            screen.getByText('most played artist')
            screen.getByText('With 123 streams, i.e. 10s')
        })

        fireEvent.click(button)

        await waitFor(() => {
            screen.getByText('TestArtistByCount')
            screen.getByText('🏆')
            screen.getByText('most played artist')
            screen.getByText('With 1230 streams, i.e. 1s')
        })
    })
})
