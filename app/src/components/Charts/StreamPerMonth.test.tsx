import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerMonth } from './StreamPerMonth'

vi.mock('../../db/queries/queryDB', () => ({
    queryDB: () => () => vi.fn(),
}))

describe('StreamPerMonth Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<StreamPerMonth />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('ms_played')
    })
})
