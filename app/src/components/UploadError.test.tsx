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
        expect(screen.getByRole('alert').textContent).toContain('Upload failed')
    })

    it('has aria-live="assertive" and aria-atomic="true"', () => {
        render(<UploadError message="Error" onDismiss={vi.fn()} />)
        const alert = screen.getByRole('alert')
        expect(alert.getAttribute('aria-live')).toBe('assertive')
        expect(alert.getAttribute('aria-atomic')).toBe('true')
    })

    it('close button has type="button"', () => {
        render(<UploadError message="Error" onDismiss={vi.fn()} />)
        const btn = screen.getByRole('button', { name: 'Dismiss error' })
        expect(btn.getAttribute('type')).toBe('button')
    })

    it('calls onDismiss when close button is clicked', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss error' }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('does not dismiss when clicking the message text', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.click(screen.getByText('Error'))
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

    it('pauses auto-dismiss timer while hovered', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        fireEvent.mouseEnter(screen.getByRole('alert'))
        act(() => {
            vi.advanceTimersByTime(8000)
        })
        expect(onDismiss).not.toHaveBeenCalled()
    })

    it('resets timer to full delay when message changes while hovered', () => {
        const onDismiss = vi.fn()
        const { rerender } = render(<UploadError message="Error 1" onDismiss={onDismiss} />)
        act(() => {
            vi.advanceTimersByTime(7000)
        })
        fireEvent.mouseEnter(screen.getByRole('alert'))
        act(() => {
            vi.advanceTimersByTime(2000)
        })
        rerender(<UploadError message="Error 2" onDismiss={onDismiss} />)
        fireEvent.mouseLeave(screen.getByRole('alert'))
        act(() => {
            vi.advanceTimersByTime(7999)
        })
        expect(onDismiss).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('resumes timer with remaining time after hover ends', () => {
        const onDismiss = vi.fn()
        render(<UploadError message="Error" onDismiss={onDismiss} />)
        act(() => {
            vi.advanceTimersByTime(3000)
        })
        fireEvent.mouseEnter(screen.getByRole('alert'))
        act(() => {
            vi.advanceTimersByTime(5000)
        })
        expect(onDismiss).not.toHaveBeenCalled()
        fireEvent.mouseLeave(screen.getByRole('alert'))
        act(() => {
            vi.advanceTimersByTime(4999)
        })
        expect(onDismiss).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(onDismiss).toHaveBeenCalledOnce()
    })
})
