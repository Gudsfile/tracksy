import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { TopTracksQueryResult } from './query'

import { TopTracks } from '.'

describe('TopTracks Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockImplementation(() =>
            Promise.resolve([
                {
                    track_name: 'track_a',
                    artist_name: 'artist_b',
                    count_streams: 10n,
                    ms_played: 0n,
                },
            ] as unknown as TopTracksQueryResult[])
        )

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(<TopTracks year={2006} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Top Tracks')
        screen.getByText('track_a — artist_b')
    })
})
