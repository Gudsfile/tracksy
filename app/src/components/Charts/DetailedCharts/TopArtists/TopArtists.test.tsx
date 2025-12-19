import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { TopArtistsQueryResult } from './query'

import { TopArtists } from '.'
describe('TopArtists Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                artist_name: 'artist_a',
                count_streams: 10n,
                ms_played: 0n,
            },
        ] as unknown as TopArtistsQueryResult[])

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(<TopArtists year={2006} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Top Artists')
        screen.getByText('artist_a')
    })
})
