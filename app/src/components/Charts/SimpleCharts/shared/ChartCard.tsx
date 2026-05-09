import type { FC, ReactNode } from 'react'

export type ChartCardProps = {
    title: string
    emoji?: string
    children: ReactNode
    className?: string
    isLoading?: boolean
    question?: string
}

export const ChartCard: FC<ChartCardProps> = ({
    title,
    emoji,
    children,
    className = '',
    isLoading = false,
    question,
}) => {
    return (
        <div
            className={`group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in ${className}`}
        >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {emoji && <span>{emoji}</span>}
                {title}
            </h3>
            {question && (
                <p className="text-xs italic text-gray-400 dark:text-gray-500 mb-3 -mt-1">
                    {question}
                </p>
            )}
            {isLoading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
            ) : (
                children
            )}
        </div>
    )
}
