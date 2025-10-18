import { useContext } from 'react'
import { ThemeContext } from '../../hooks/ThemeContext'
import { THEMES, type Theme } from '../../hooks/theme.constants'

const THEME_CONFIG = {
    system: {
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        label: (effectiveTheme: string) => `System (${effectiveTheme})`,
    },
    dark: {
        icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
        label: () => 'Dark',
    },
    light: {
        icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
        label: () => 'Light',
    },
} as const

const Icon = ({ path }: { path: string }) => (
    <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={path}
        />
    </svg>
)

const cycleTheme = (current: Theme): Theme => {
    const currentIndex = THEMES.indexOf(current)
    return THEMES[(currentIndex + 1) % THEMES.length]
}

export function ThemeToggle() {
    const { theme, setTheme, effectiveTheme } = useContext(ThemeContext)

    const config = THEME_CONFIG[theme]
    const label = config.label(effectiveTheme)

    return (
        <button
            onClick={() => setTheme(cycleTheme(theme))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 shadow-sm"
            aria-label={`Current theme: ${label}. Click to change theme.`}
            title={label}
        >
            <Icon path={config.icon} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
