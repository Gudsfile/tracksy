import { useState } from 'react'
import { insertUrlInDatabase } from '../db/queries/insertUrlInDatabase'

export function useDemo() {
    const [isDemoReady, setIsDemoReady] = useState(false)

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
        if (!demoJsonUrl) return
        try {
            await insertUrlInDatabase(demoJsonUrl)
            setIsDemoReady(true)
        } catch {
            setIsDemoReady(false)
        }
    }

    return { isDemoReady, handleDemoButtonClick, demoJsonUrl }
}
