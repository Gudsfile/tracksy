import { useState, useEffect } from 'react'
import {
    THEME_STORAGE_KEY,
    THEMES,
    DARK_CLASS,
    MEDIA_QUERY,
    type Theme,
} from './theme.constants'

const isSystemDark = () => window.matchMedia?.(MEDIA_QUERY)?.matches ?? false

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' =>
    theme === 'system' ? (isSystemDark() ? 'dark' : 'light') : theme

const applyTheme = (theme: Theme) => {
    const shouldBeDark = getEffectiveTheme(theme) === 'dark'
    document.documentElement.classList.toggle(DARK_CLASS, shouldBeDark)
}

const getStoredTheme = (): Theme => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return THEMES.includes(stored as Theme) ? (stored as Theme) : 'system'
}

/**
 * Hook to manage theme state with persistence and system preference support.
 * Follows Tailwind's recommended dark mode pattern.
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getStoredTheme)

    useEffect(() => {
        applyTheme(theme)
        localStorage.setItem(THEME_STORAGE_KEY, theme)
    }, [theme])

    useEffect(() => {
        if (theme !== 'system') return

        const mediaQuery = window.matchMedia(MEDIA_QUERY)
        const handleChange = () => applyTheme('system')

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    return {
        theme,
        setTheme,
        effectiveTheme: getEffectiveTheme(theme),
    } as const
}
