import type { FC, ReactNode } from 'react'

export type ChartCardProps = {
    title: string
    emoji?: string
    children: ReactNode
    className?: string
}

export const ChartCard: FC<ChartCardProps> = ({
    title,
    emoji,
    children,
    className = '',
}) => {
    return (
        <div
            className={`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in ${className}`}
        >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {emoji && <span>{emoji}</span>}
                {title}
            </h3>
            {children}
        </div>
    )
}
