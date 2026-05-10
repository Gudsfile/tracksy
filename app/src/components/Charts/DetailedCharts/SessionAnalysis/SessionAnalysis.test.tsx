import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'
import type { SessionAnalysisDetailedResult } from './query'

import { SessionAnalysis } from '.'

const queryResult: SessionAnalysisDetailedResult[] = [
    {
        session_id: 1,
        track_count: 5,
        duration_ms: 1800000,
        session_start: '2025-01-10T20:00:00',
        session_end: '2025-01-10T20:30:00',
        day_of_week: 5,
    },
    {
        session_id: 2,
        track_count: 8,
        duration_ms: 3600000,
        session_start: '2025-01-15T21:00:00',
        session_end: '2025-01-15T22:00:00',
        day_of_week: 3,
    },
]

describe('SessionAnalysis Detailed Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(queryResult)

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render three sub-charts as SVGs', async () => {
        const { container } = render(<SessionAnalysis year={2025} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(3)
        })
    })

    it('should render all sessions when year is undefined', async () => {
        const { container } = render(<SessionAnalysis year={undefined} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
        })
    })
})
