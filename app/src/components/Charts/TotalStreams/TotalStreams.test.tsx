import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../db/queries/queryDB'
import * as db from '../../../db/getDB'
import { TotalStreamsQueryResult } from './query'

import { TotalStreams } from '.'
describe('TotalStreams Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                count_streams: 123,
                ms_played: 1000,
            },
        ] as TotalStreamsQueryResult[])

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

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
