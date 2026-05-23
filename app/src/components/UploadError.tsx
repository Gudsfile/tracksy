import { useEffect } from 'react'

const DISMISS_DELAY_MS = 8000

interface UploadErrorProps {
    message: string
    onDismiss: () => void
}

export function UploadError({ message, onDismiss }: UploadErrorProps) {
    useEffect(() => {
        const t = setTimeout(onDismiss, DISMISS_DELAY_MS)
        return () => clearTimeout(t)
    }, [message, onDismiss])

    return (
        <div
            role="alert"
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg"
        >
            <span>{message}</span>
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
