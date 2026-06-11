export const TIMEZONE_STORAGE_KEY = 'tracksy-timezone' as const

export const getStoredTimezone = (): string =>
    localStorage.getItem(TIMEZONE_STORAGE_KEY) ??
    Intl.DateTimeFormat().resolvedOptions().timeZone
