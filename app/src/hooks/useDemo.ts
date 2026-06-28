import { useState } from 'react'
import { insertUrlInDatabase } from '../db/queries/insertUrlInDatabase'

type DemoProgress = { stage: string; percent: number }

export function useDemo() {
    const [isDemoReady, setIsDemoReady] = useState(false)
    const [demoProgress, setDemoProgress] = useState<DemoProgress | null>(null)

    const demoJsonUrl: URL | undefined = (() => {
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
    })()

    const handleDemoButtonClick = async () => {
        setIsDemoReady(false)
        setDemoProgress(null)
        if (!demoJsonUrl) return
        try {
            await insertUrlInDatabase(demoJsonUrl, (stage, percent) =>
                setDemoProgress({ stage, percent })
            )
            setIsDemoReady(true)
        } catch {
            setIsDemoReady(false)
        } finally {
            setDemoProgress(null)
        }
    }

    return { isDemoReady, handleDemoButtonClick, demoJsonUrl, demoProgress }
}
