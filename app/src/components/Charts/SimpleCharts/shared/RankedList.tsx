import type { FC } from 'react'
import { rankEmojis } from './rankEmojis'

export type RankedItem = {
    primary: string
    secondary?: string
    score: string
}

type Props = {
    items: RankedItem[]
}

export const RankedList: FC<Props> = ({ items }) => {
    return (
        <ul className="space-y-2" role="list">
            {items.map((item, index) => (
                <li
                    key={`${item.primary}-${item.secondary ?? index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    role="listitem"
                >
                    <span className="text-xl flex-shrink-0">
                        {rankEmojis[index]}
                    </span>
                    <div className="flex-1 min-w-0" title={item.primary}>
                        <div className="font-medium truncate">
                            {item.primary}
                        </div>
                        {item.secondary && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.secondary}
                            </div>
                        )}
                    </div>
                    <div className="text-sm font-bold text-brand-purple dark:text-brand-purple flex-shrink-0">
                        {item.score}
                    </div>
                </li>
            ))}
        </ul>
    )
}
