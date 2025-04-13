import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerHour } from '.'
import React from 'react'

const queryResult = [
    { username: 'alice', count_stream: 10, hour: 0 },
    { username: 'alice', count_stream: 12, hour: 1 },
    { username: 'alice', count_stream: 14, hour: 2 },
    { username: 'alice', count_stream: 16, hour: 3 },
    { username: 'alice', count_stream: 18, hour: 4 },
    { username: 'alice', count_stream: 20, hour: 5 },
    { username: 'alice', count_stream: 2, hour: 6 },
    { username: 'alice', count_stream: 4, hour: 7 },
    { username: 'bob', count_stream: 20, hour: 7 },
    { username: 'bob', count_stream: 20, hour: 8 },
]

vi.mock('../../db/queries/queryDB', () => ({
    queryDB: () => () => queryResult,
}))

describe('StreamPerHour Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<StreamPerHour />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(3)
            expect(
                container.querySelectorAll('.stream-per-hour-hours-text text')
            ).toHaveLength(9)
            expect(
                container.querySelectorAll('.stream-per-hour-points circle')
            ).toHaveLength(10)
        })
        screen.getByText('Streams per hour')
        screen.getByText('alice')
        screen.getByText('bob')
    })
})
