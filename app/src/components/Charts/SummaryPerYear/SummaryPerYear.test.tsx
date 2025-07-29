import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SummaryPerYear } from '.'
import React from 'react'

const queryResult = [
    { year: '2024', count_stream: 10131, type: 'count_new_tracks_played' },
    { year: '2024', count_stream: 3861, type: 'count_unique_track_played' },
    { year: '2024', count_stream: 17932, type: 'count_other_tracks_played' },
    { year: '2025', count_stream: 1, type: 'count_unique_track_played' },
]

vi.mock('../../../db/queries/queryDB', () => ({
    queryDB: () => () => queryResult,
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('SummaryPerYear Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<SummaryPerYear />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(4)
        })
        screen.getByText('Portition of new streams')
        screen.getByText('count_new_tracks_played')
        screen.getByText('count_unique_track_played')
        screen.getByText('count_other_tracks_played')
    })
})
