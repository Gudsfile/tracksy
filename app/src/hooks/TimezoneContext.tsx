import { createContext, type ReactNode } from 'react'
import { useTimezone } from './useTimezone'
import { getStoredTimezone } from '../db/timezoneStorage'

interface TimezoneContextValue {
    timezone: string
    setTimezone: (tz: string) => Promise<void>
}

export const TimezoneContext = createContext<TimezoneContextValue>({
    timezone: getStoredTimezone(),
    setTimezone: async () => {},
})

export function TimezoneProvider({ children }: { children: ReactNode }) {
    const value = useTimezone()
    return (
        <TimezoneContext.Provider value={value}>
            {children}
        </TimezoneContext.Provider>
    )
}
