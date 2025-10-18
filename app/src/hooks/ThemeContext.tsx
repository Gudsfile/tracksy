import { createContext, type ReactNode } from 'react'
import { useTheme } from './useTheme'
import type { Theme } from './theme.constants'

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
    effectiveTheme: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    setTheme: () => {},
    effectiveTheme: 'light',
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const themeValue = useTheme()
    return (
        <ThemeContext.Provider value={themeValue}>
            {children}
        </ThemeContext.Provider>
    )
}
