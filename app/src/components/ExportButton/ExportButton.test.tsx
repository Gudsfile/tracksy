import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { RefObject } from 'react'
import { ExportButton } from './ExportButton'
import * as exporter from '../../utils/exportElementAsImage'

describe('ExportButton', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    const renderWithTarget = (filename?: string) => {
        const element = document.createElement('div')
        const targetRef = { current: element } as RefObject<HTMLDivElement>
        render(<ExportButton targetRef={targetRef} filename={filename} />)
        return element
    }

    it('renders the export button', () => {
        renderWithTarget()
        const button = screen.getByRole('button', { name: /export/i })
        expect(button.textContent).toContain('Export as image')
    })

    it('captures the target element when clicked', async () => {
        const spy = vi
            .spyOn(exporter, 'exportElementAsImage')
            .mockResolvedValue(undefined)

        const element = renderWithTarget('my-stats.png')
        fireEvent.click(screen.getByRole('button', { name: /export/i }))

        await waitFor(() =>
            expect(spy).toHaveBeenCalledWith(element, 'my-stats.png')
        )
    })

    it('shows a failure state when export throws', async () => {
        vi.spyOn(exporter, 'exportElementAsImage').mockRejectedValue(
            new Error('capture failed')
        )
        vi.spyOn(console, 'error').mockImplementation(() => {})

        renderWithTarget()
        fireEvent.click(screen.getByRole('button', { name: /export/i }))

        await screen.findByText(/Export failed/i)
    })

    it('does nothing when the target is missing', () => {
        const spy = vi
            .spyOn(exporter, 'exportElementAsImage')
            .mockResolvedValue(undefined)

        const targetRef = { current: null } as RefObject<HTMLDivElement>
        render(<ExportButton targetRef={targetRef} />)
        fireEvent.click(screen.getByRole('button', { name: /export/i }))

        expect(spy).not.toHaveBeenCalled()
    })
})
