import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { TopAlbumsQueryResult } from './query'

import { TopAlbums } from '.'
import { buildPlot } from './plot'
describe('TopAlbums Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                album_name: 'album_a',
                count_streams: 10n,
                ms_played: 0n,
            },
        ] as unknown as TopAlbumsQueryResult[])

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(<TopAlbums year={2006} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Top Albums')
        screen.getByText('album_a')
    })

    it('returns empty plot when data is empty', () => {
        const result = buildPlot([], false)
        expect(result).toBeDefined()
    })
})
