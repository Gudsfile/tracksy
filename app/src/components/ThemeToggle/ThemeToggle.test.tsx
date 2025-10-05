import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

// Mock the useTheme hook
vi.mock('../../hooks/useTheme', () => ({
    useTheme: vi.fn(),
}))

import { useTheme } from '../../hooks/useTheme'

describe('ThemeToggle', () => {
    const mockSetTheme = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render with system theme by default', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
            effectiveTheme: 'light',
        })

        render(<ThemeToggle />)

        screen.getByText('System (light)')
    })

    it('should render with light theme', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
            effectiveTheme: 'light',
        })

        render(<ThemeToggle />)

        screen.getByText('Light')
    })

    it('should render with dark theme', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
            effectiveTheme: 'dark',
        })

        render(<ThemeToggle />)

        screen.getByText('Dark')
    })

    it('should cycle from light to dark when clicked', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
            effectiveTheme: 'light',
        })

        render(<ThemeToggle />)

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should cycle from dark to system when clicked', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
            effectiveTheme: 'dark',
        })

        render(<ThemeToggle />)

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockSetTheme).toHaveBeenCalledWith('system')
    })

    it('should cycle from system to light when clicked', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
            effectiveTheme: 'light',
        })

        render(<ThemeToggle />)

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should have accessible label', () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
            effectiveTheme: 'light',
        })

        render(<ThemeToggle />)

        const button = screen.getByRole('button')
        expect(button.getAttribute('aria-label')).toBe(
            'Current theme: Light. Click to change theme.'
        )
    })
})
