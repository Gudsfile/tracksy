import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerDayOfWeek } from '.'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () => () => [
        {
            dayOfWeek: 1,
            hour: 1,
            count_streams: 10,
        },
    ],
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('StreamPerDayOfWeek Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<StreamPerDayOfWeek year={2006} />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Stream per hour and day of week')
    })
})
