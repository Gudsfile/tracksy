import type { FC } from 'react'

export type FunFactProps = {
    fact_type: string
    title: string
    emoji: string
    main_text: string
    second_text?: string | undefined
    value: string | number
    unit?: string | undefined
    context?: string | undefined
}

type Props = {
    fact: FunFactProps
    onRefresh: () => void
    isLoading: boolean
}

export const FunFacts: FC<Props> = ({ fact, onRefresh, isLoading }) => {
    const valueDisplayed =
        typeof fact.value === 'number'
            ? fact.value.toLocaleString()
            : fact.value

    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl shadow border border-purple-100 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <div className="absolute top-0 right-0 p-4 transition-opacity">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="New fact"
                >
                    <span
                        className={`block text-xl ${isLoading ? 'animate-spin' : ''}`}
                    >
                        🔄
                    </span>
                </button>
            </div>

            <div
                className="flex flex-col md:flex-row items-center gap-6"
                data-fact-type={fact.fact_type}
            >
                <div className="text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow">
                    {fact.emoji}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                        {fact.title}
                    </div>

                    <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words text-balance">
                        {fact.main_text}
                    </div>

                    <div className="text-lg text-gray-600 dark:text-gray-300">
                        {fact.second_text}{' '}
                        {fact.second_text && valueDisplayed ? '(' : undefined}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {valueDisplayed}
                            {fact.unit === '%' ? fact.unit : undefined}
                        </span>{' '}
                        {fact.unit !== '%' ? fact.unit : undefined}
                        {fact.second_text && valueDisplayed ? ')' : undefined}
                    </div>

                    {fact.context && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                            {fact.context}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
