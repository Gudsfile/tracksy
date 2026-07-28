import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'

import { Common } from '.'

const ERROR_MESSAGE = 'Failed to load chart data'

type Row = Record<string, string | number | null>

const buildPlot = () => {
    const el = document.createElement('div')
    el.setAttribute('data-testid', 'plot')
    return el as unknown as Element
}

describe('Common Component', () => {
    beforeEach(() => {
        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the built plot when the query succeeds', async () => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue([
            { value: 1 },
        ] as Row[])

        render(<Common<Row> query="SELECT 1" buildPlot={buildPlot} />)

        await waitFor(() => {
            expect(screen.getByTestId('plot')).toBeDefined()
        })
    })

    it('shows an error indication when the query throws', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        vi.spyOn(query, 'queryDBAsJSON').mockRejectedValue(
            new Error('DB failure')
        )

        render(<Common<Row> query="SELECT 1" buildPlot={buildPlot} />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
        expect(consoleSpy).toHaveBeenCalled()
    })
})
