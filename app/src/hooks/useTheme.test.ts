import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTheme } from './useTheme'
import { THEME_STORAGE_KEY } from './theme.constants'

describe('useTheme', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
        // Reset document classes
        document.documentElement.classList.remove('dark')
        // Clear all mocks
        vi.clearAllMocks()

        // Mock matchMedia for all tests (default to light mode)
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })
    })

    it('should initialize with system theme by default', () => {
        const { result } = renderHook(() => useTheme())
        expect(result.current.theme).toBe('system')
    })

    it('should initialize from localStorage if available', () => {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark')
        const { result } = renderHook(() => useTheme())
        expect(result.current.theme).toBe('dark')
    })

    it('should apply dark class when theme is dark', () => {
        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.setTheme('dark')
        })

        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(result.current.effectiveTheme).toBe('dark')
    })

    it('should remove dark class when theme is light', () => {
        // Start with dark
        document.documentElement.classList.add('dark')

        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.setTheme('light')
        })

        expect(document.documentElement.classList.contains('dark')).toBe(false)
        expect(result.current.effectiveTheme).toBe('light')
    })

    it('should save theme to localStorage when changed', () => {
        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.setTheme('dark')
        })

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    })

    it('should respect system preference when theme is system', () => {
        // Mock matchMedia to return dark mode
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        })

        const { result } = renderHook(() => useTheme())

        act(() => {
            result.current.setTheme('system')
        })

        expect(result.current.effectiveTheme).toBe('dark')
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should cycle through themes correctly', () => {
        const { result } = renderHook(() => useTheme())

        // Start with system
        expect(result.current.theme).toBe('system')

        // Change to light
        act(() => {
            result.current.setTheme('light')
        })
        expect(result.current.theme).toBe('light')

        // Change to dark
        act(() => {
            result.current.setTheme('dark')
        })
        expect(result.current.theme).toBe('dark')

        // Change back to system
        act(() => {
            result.current.setTheme('system')
        })
        expect(result.current.theme).toBe('system')
    })
})
