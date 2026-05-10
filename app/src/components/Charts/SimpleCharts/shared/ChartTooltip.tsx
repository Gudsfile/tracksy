import type { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
    x: number
    y: number
    children: ReactNode
}

export const ChartTooltip: FC<Props> = ({ x, y, children }) => {
    return createPortal(
        <div
            className="fixed z-50 pointer-events-none"
            style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
        >
            <div className="bg-gray-900 dark:bg-slate-700 text-white rounded-lg shadow-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap mb-2">
                {children}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-slate-700" />
        </div>,
        document.body
    )
}
