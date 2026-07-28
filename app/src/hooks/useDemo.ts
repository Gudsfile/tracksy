import { useMemo, useState } from 'react'
import { insertUrlInDatabase } from '../db/queries/insertUrlInDatabase'

type DemoProgress = { stage: string; percent: number }

/**
 * @param onFail - Called when loading the demo dataset fails, so the caller can
 *   surface the failure to the user (mirrors the file-upload `onFail` path).
 */
export function useDemo({
    onFail,
}: { onFail?: (error: unknown) => void } = {}) {
    const [isDemoReady, setIsDemoReady] = useState(false)
    const [demoProgress, setDemoProgress] = useState<DemoProgress | null>(null)

    // Computed once per hook instance instead of on every render — avoids
    // re-`new URL()` churn and repeated `console.warn` spam when the env var is
    // missing/invalid.
    const demoJsonUrl: URL | undefined = useMemo(() => {
        const url = import.meta.env.PUBLIC_DEMO_JSON_URL
        if (!url) {
            console.warn('Missing PUBLIC_DEMO_JSON_URL environment variable')
            return undefined
        }
        try {
            return new URL(url)
        } catch {
            console.warn('Invalid PUBLIC_DEMO_JSON_URL environment variable:', {
                url,
            })
            return undefined
        }
    }, [])

    const handleDemoButtonClick = async () => {
        setIsDemoReady(false)
        setDemoProgress(null)
        if (!demoJsonUrl) return
        try {
            await insertUrlInDatabase(demoJsonUrl, (stage, percent) =>
                setDemoProgress({ stage, percent })
            )
            setIsDemoReady(true)
        } catch (error) {
            console.error('Failed to load demo data:', error)
            setIsDemoReady(false)
            onFail?.(error)
        } finally {
            setDemoProgress(null)
        }
    }

    return { isDemoReady, handleDemoButtonClick, demoJsonUrl, demoProgress }
}
