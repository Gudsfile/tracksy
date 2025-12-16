import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as query from '../../../../db/queries/queryDB'
import { StreamPerHourQueryResult } from './query'
import * as db from '../../../../db/getDB'

import { StreamPerHour } from '.'

const queryResult = [
    { count_streams: 10, hour: 0, ms_played: 0 },
    { count_streams: 12, hour: 1, ms_played: 1 },
    { count_streams: 14, hour: 2, ms_played: 2 },
    { count_streams: 16, hour: 3, ms_played: 3 },
    { count_streams: 18, hour: 4, ms_played: 4 },
    { count_streams: 20, hour: 5, ms_played: 5 },
    { count_streams: 2, hour: 6, ms_played: 6 },
    { count_streams: 4, hour: 7, ms_played: 7 },
]

describe('StreamPerHour Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockImplementation(() =>
            Promise.resolve(queryResult as StreamPerHourQueryResult[])
        )

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(
            <StreamPerHour year={2020} maxValue={100} />
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
            expect(
                container.querySelectorAll('.stream-per-hour-hours-text text')
            ).toHaveLength(8)
            expect(
                container.querySelectorAll('.stream-per-hour-points circle')
            ).toHaveLength(8)
        })
        screen.getByText('Number of streams per hour')
    })
})
