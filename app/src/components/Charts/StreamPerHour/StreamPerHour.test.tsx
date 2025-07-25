import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerHour } from '.'
import React from 'react'

const queryResult = [
    { count_stream: 10, hour: 0 },
    { count_stream: 12, hour: 1 },
    { count_stream: 14, hour: 2 },
    { count_stream: 16, hour: 3 },
    { count_stream: 18, hour: 4 },
    { count_stream: 20, hour: 5 },
    { count_stream: 2, hour: 6 },
    { count_stream: 4, hour: 7 },
]

vi.mock('../../../db/queries/queryDB', () => ({
    queryDB: () => () => queryResult,
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('StreamPerHour Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<StreamPerHour />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
            expect(
                container.querySelectorAll('.stream-per-hour-hours-text text')
            ).toHaveLength(8)
            expect(
                container.querySelectorAll('.stream-per-hour-points circle')
            ).toHaveLength(8)
        })
        screen.getByText('Streams per hour')
    })
})
