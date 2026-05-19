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
            aria-label="Dismiss error"
            tabIndex={0}
            onClick={onDismiss}
            onKeyDown={(e) => e.key === 'Enter' && onDismiss()}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer rounded-lg bg-rose-700 px-5 py-3 text-white shadow-lg hover:bg-red-700 transition-colors"
        >
            {message}
        </div>
    )
}
