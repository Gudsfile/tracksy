import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import * as cached from '../../../../db/queries/queryDBCached'

import { Common } from '.'

const ERROR_MESSAGE = 'DB failure'

type Row = Record<string, string | number | null>

const buildPlot = () => {
    const el = document.createElement('div')
    el.setAttribute('data-testid', 'plot')
    return el as unknown as Element
}

describe('Common Component', () => {
    beforeEach(() => {
        cached.clearQueryCache()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders the built plot when the query succeeds', async () => {
        vi.spyOn(cached, 'queryDBCached').mockResolvedValue([
            { value: 1 },
        ] as Row[])

        render(<Common<Row> query="SELECT 1" buildPlot={buildPlot} />)

        await waitFor(() => {
            expect(screen.getByTestId('plot')).toBeDefined()
        })
    })

    it('shows an error indication when the query throws', async () => {
        vi.spyOn(cached, 'queryDBCached').mockRejectedValue(
            new Error(ERROR_MESSAGE)
        )

        render(<Common<Row> query="SELECT 1" buildPlot={buildPlot} />)

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })
    })

    it('clears the error on a subsequent successful load', async () => {
        const querySpy = vi.spyOn(cached, 'queryDBCached')
        querySpy.mockRejectedValueOnce(new Error(ERROR_MESSAGE))
        querySpy.mockResolvedValue([{ value: 1 }] as Row[])

        const { rerender } = render(
            <Common<Row> query="SELECT 1" buildPlot={buildPlot} />
        )

        await waitFor(() => {
            expect(screen.getByText(ERROR_MESSAGE)).toBeDefined()
        })

        rerender(<Common<Row> query="SELECT 2" buildPlot={buildPlot} />)

        await waitFor(() => {
            expect(screen.getByTestId('plot')).toBeDefined()
        })
        expect(screen.queryByText(ERROR_MESSAGE)).toBeNull()
    })
})
