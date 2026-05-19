import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { UploadError } from './UploadError'

describe('UploadError', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders with role="alert" and displays the message', () => {
        render(<UploadError message="Upload failed" onDismiss={vi.fn()} />)
        const alert = screen.getByRole('alert')
        expect(alert.textContent).toBe('Upload failed')
    })

    it('calls onDismiss when clicked', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.click(screen.getByRole('alert'))
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('calls onDismiss when Enter is pressed', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.keyDown(screen.getByRole('alert'), { key: 'Enter' })
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('does not call onDismiss for non-Enter key presses', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.keyDown(screen.getByRole('alert'), { key: 'Escape' })
        expect(onDismiss).not.toHaveBeenCalled()
    })

    it('calls onDismiss automatically after DISMISS_DELAY_MS', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        expect(onDismiss).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(8000)
        })
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('does not call onDismiss before DISMISS_DELAY_MS elapses', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        act(() => {
            vi.advanceTimersByTime(7999)
        })
        expect(onDismiss).not.toHaveBeenCalled()
    })
})
