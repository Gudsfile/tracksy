import { useState } from 'react'
import { TIMEZONE_STORAGE_KEY, getStoredTimezone } from '../db/timezoneStorage'
import { getDB } from '../db/getDB'
import { precomputeDerivedTables } from '../db/precompute'
import { dispatchTimezoneChanged } from '../db/dataSignal'

export function useTimezone() {
    const [timezone, setTimezoneState] = useState<string>(getStoredTimezone)

    const setTimezone = async (tz: string) => {
        setTimezoneState(tz)
        localStorage.setItem(TIMEZONE_STORAGE_KEY, tz)
        try {
            const { conn } = await getDB()
            await precomputeDerivedTables(conn, tz)
            dispatchTimezoneChanged()
        } catch {
            // DB not ready or no data loaded yet
        }
    }

    return { timezone, setTimezone } as const
}
