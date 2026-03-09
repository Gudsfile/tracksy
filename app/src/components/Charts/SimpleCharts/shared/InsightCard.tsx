import type { FC, ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export const InsightCard: FC<Props> = ({ children }) => {
    return (
        <div className="text-sm text-center font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-slate-700/50 p-2 rounded-lg">
            {children}
        </div>
    )
}
