import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'
import { ThemeContext } from '../../hooks/ThemeContext'
import type { Theme } from '../../hooks/theme.constants'

describe('ThemeToggle', () => {
    const mockSetTheme = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderWithTheme = (theme: Theme, effectiveTheme: 'light' | 'dark') =>
        render(
            <ThemeContext.Provider
                value={{ theme, setTheme: mockSetTheme, effectiveTheme }}
            >
                <ThemeToggle />
            </ThemeContext.Provider>
        )

    it('should render with system theme by default', () => {
        renderWithTheme('system', 'light')
        screen.getByTitle('System (light)')
    })

    it('should render with light theme', () => {
        renderWithTheme('light', 'light')
        screen.getByTitle('Light')
    })

    it('should render with dark theme', () => {
        renderWithTheme('dark', 'dark')
        screen.getByTitle('Dark')
    })

    it('should cycle from light to dark when clicked', () => {
        renderWithTheme('light', 'light')
        fireEvent.click(screen.getByRole('button'))
        expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should cycle from dark to system when clicked', () => {
        renderWithTheme('dark', 'dark')
        fireEvent.click(screen.getByRole('button'))
        expect(mockSetTheme).toHaveBeenCalledWith('system')
    })

    it('should cycle from system to light when clicked', () => {
        renderWithTheme('system', 'light')
        fireEvent.click(screen.getByRole('button'))
        expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should have accessible label', () => {
        renderWithTheme('light', 'light')
        const button = screen.getByRole('button')
        expect(button.getAttribute('aria-label')).toBe(
            'Current theme: Light. Click to change theme.'
        )
    })
})
