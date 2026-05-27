import type { ReactNode } from 'react'

type InsightRowProps = {
    label: ReactNode
    value: ReactNode
}

export function InsightRow({ label, value }: InsightRowProps) {
    return (
        <li
            className="flex justify-between items-center mt-1 first:mt-0"
            role="listitem"
        >
            <span className="text-sm text-gray-600 dark:text-gray-400">
                {label}
            </span>
            <span className="font-bold text-sm">{value}</span>
        </li>
    )
}

type InsightListProps = {
    children: ReactNode
}

export function InsightList({ children }: InsightListProps) {
    return (
        <ul
            className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
            role="list"
        >
            {children}
        </ul>
    )
}
