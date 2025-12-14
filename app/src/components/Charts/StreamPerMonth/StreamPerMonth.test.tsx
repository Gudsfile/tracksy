import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import * as query from '../../../db/queries/queryDB'
import * as db from '../../../db/getDB'
import { StreamPerMonthQueryResult } from './query'

import { StreamPerMonth } from '.'

describe('StreamPerMonth Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(
            [] as StreamPerMonthQueryResult[]
        )
        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(
            <StreamPerMonth year={2006} maxValue={100} />
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
    })
})
