import { useEffect, useRef, useState } from 'react'

const DISMISS_DELAY_MS = 8000

interface UploadErrorProps {
    message: string
    onDismiss: () => void
}

export function UploadError({ message, onDismiss }: UploadErrorProps) {
    const [hovered, setHovered] = useState(false)
    const remainingRef = useRef(DISMISS_DELAY_MS)
    const startRef = useRef(Date.now())

    useEffect(() => {
        remainingRef.current = DISMISS_DELAY_MS
    }, [message])

    useEffect(() => {
        if (hovered) {
            remainingRef.current -= Date.now() - startRef.current
            return
        }
        startRef.current = Date.now()
        const t = setTimeout(onDismiss, remainingRef.current)
        return () => clearTimeout(t)
    }, [hovered, message, onDismiss])

    return (
        <div
            role="alert"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg"
        >
            <span className="select-text">{message}</span>
            <button
                onClick={onDismiss}
                className="ml-1 rounded p-0.5 hover:bg-rose-600 transition-colors"
                aria-label="Dismiss error"
            >
                ✕
            </button>
        </div>
    )
}
