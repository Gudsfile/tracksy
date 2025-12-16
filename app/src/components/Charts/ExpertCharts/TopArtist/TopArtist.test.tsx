import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import * as db from '../../../../db/getDB'
import * as query from '../../../../db/queries/queryDB'
import * as queries from './query'

import { TopArtist } from '.'

describe('TopArtist Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockImplementation((query) => {
            if (query === queries.queryTopArtistByCount()) {
                return Promise.resolve([
                    {
                        artist_name: 'TestArtistByCount',
                        count_streams: 1230,
                        ms_played: 1000,
                    },
                ] as queries.TopArtistQueryResult[])
            }
            if (query === queries.queryTopArtistByDuration()) {
                return Promise.resolve([
                    {
                        artist_name: 'TestArtistByDuration',
                        count_streams: 123,
                        ms_played: 10000,
                    },
                ] as queries.TopArtistQueryResult[])
            }
            return Promise.resolve([] as queries.TopArtistQueryResult[])
        })

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

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
