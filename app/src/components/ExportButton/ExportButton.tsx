import { useCallback, useState, type RefObject } from 'react'
import { exportElementAsImage } from '../../utils/exportElementAsImage'

type ExportButtonProps = {
    /** Element to capture as an image. */
    targetRef: RefObject<HTMLElement | null>
    /** Optional filename for the downloaded PNG. */
    filename?: string
}

type Status = 'idle' | 'exporting' | 'error'

const LABELS: Record<Status, string> = {
    idle: '📸 Export as image',
    exporting: '⏳ Exporting…',
    error: '⚠️ Export failed',
}

export function ExportButton({ targetRef, filename }: ExportButtonProps) {
    const [status, setStatus] = useState<Status>('idle')

    const handleClick = useCallback(async () => {
        const element = targetRef.current
        if (!element) return

        setStatus('exporting')
        try {
            await exportElementAsImage(element, filename)
            setStatus('idle')
        } catch (error) {
            console.error('Failed to export results as image:', error)
            setStatus('error')
        }
    }, [targetRef, filename])

    return (
        <button
            type="button"
            title="Export your results as a shareable image"
            aria-label="Export your results as a shareable image"
            disabled={status === 'exporting'}
            onClick={handleClick}
            className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md shadow-lg border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <span className="whitespace-nowrap">{LABELS[status]}</span>
        </button>
    )
}
