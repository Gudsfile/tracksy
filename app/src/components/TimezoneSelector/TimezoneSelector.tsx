import { useContext } from 'react'
import { TimezoneContext } from '../../hooks/TimezoneContext'

const TIMEZONES: string[] =
    typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('timeZone')
        : [Intl.DateTimeFormat().resolvedOptions().timeZone]

export function TimezoneSelector() {
    const { timezone, setTimezone } = useContext(TimezoneContext)

    return (
        <select
            value={timezone}
            onChange={(e) => void setTimezone(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md border border-gray-300/60 dark:border-slate-700/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
            aria-label="Timezone for charts"
            title={`Charts timezone: ${timezone}`}
        >
            {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                    {tz}
                </option>
            ))}
        </select>
    )
}
