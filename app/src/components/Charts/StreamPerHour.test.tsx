import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { StreamPerHour } from './StreamPerHour'

vi.mock('../../db/queries/queryDB', () => ({
    queryDB: () => () => vi.fn(),
}))

describe('StreamPerHour Component', () => {
    it('should render the svg', async () => {
        const { container } = render(<StreamPerHour />)

        await waitFor(() => {
            expect(container.querySelectorAll('svg')).toHaveLength(1)
        })
        screen.getByText('Nombre de streams')
        screen.getByText('Heure (HH)')
    })
})
