export const THEME_STORAGE_KEY = 'tracksy-theme' as const

export const THEMES = ['light', 'dark', 'system'] as const

export type Theme = (typeof THEMES)[number]

export const DARK_CLASS = 'dark' as const

export const MEDIA_QUERY = '(prefers-color-scheme: dark)' as const
