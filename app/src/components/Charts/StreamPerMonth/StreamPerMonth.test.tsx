import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { StreamPerMonth } from '.'

vi.mock('../../../db/queries/queryDB', () => ({
    queryDBAsJSON: () => () => vi.fn(),
}))

vi.mock('../../../db/getDB', () => ({
    getDB: vi.fn(() => Promise.resolve({})),
    insertFilesInDatabase: vi.fn(() => Promise.resolve()),
}))

describe('StreamPerMonth Component', () => {
    it('should render the svg', async () => {
        const { container } = render(
            <StreamPerMonth year={2006} maxValue={100} />
        )

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
    })
})
