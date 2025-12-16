import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerDayOfWeek } from '.'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import { StreamPerDayOfWeekQueryResult } from './query'

describe('StreamPerDayOfWeek Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            {
                dayOfWeek: 1,
                hour: 1,
                count_streams: 10,
            },
        ] as StreamPerDayOfWeekQueryResult[])

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(<StreamPerDayOfWeek year={2006} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Stream per hour and day of week')
    })
})
