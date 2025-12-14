import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../db/queries/queryDB'
import * as db from '../../../db/getDB'
import { SummaryPerYearQueryResult } from './query'

import { SummaryPerYear } from '.'

const queryResult = [
    { year: '2024', count_streams: 10131, type: 'new_unique' },
    { year: '2024', count_streams: 3861, type: 'new_repeat' },
    { year: '2024', count_streams: 17932, type: 'old_unique' },
    { year: '2025', count_streams: 1, type: 'old_repeat' },
]

describe('SummaryPerYear Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(
            queryResult as unknown as SummaryPerYearQueryResult[]
        )

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the svg', async () => {
        const { container } = render(<SummaryPerYear year={2024} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(3)
        })
        screen.getByText('Distribution of streams')
        screen.getByText('First Listen')
        screen.getByText('Repeats')
        screen.getByText('44% New Tracks')
        screen.getByText('56% Old Tracks')
    })
})
