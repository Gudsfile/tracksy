import type { FC } from 'react'
import type { FunFactResult } from './queries'

export type FunFactProps = {
    fact_type: string
    title: string
    emoji: string
    main_text: string | null
    second_text?: string
    value?: number | string
    unit?: string
    context?: string
}

type Props = {
    fact: FunFactProps | null
    onRefresh: () => void
    isLoading: boolean
    error: string | null
}

type ContentProps = {
    fact: FunFactResult | null
    error: string | null
    isLoading: boolean
}

const FunFactContent: FC<ContentProps> = ({ fact, error, isLoading }) => {
    if (fact) {
        const { main_text, second_text, value, unit, context } = fact
        const valueDisplayed =
            typeof value === 'number' ? value.toLocaleString() : value

        return (
            <>
                {main_text && (
                    <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words text-balance">
                        {main_text}
                    </div>
                )}
                <div className="text-lg text-gray-600 dark:text-gray-300">
                    {second_text}{' '}
                    {second_text && valueDisplayed ? '(' : undefined}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                        {valueDisplayed}
                        {unit === '%' ? unit : undefined}
                    </span>{' '}
                    {unit !== '%' ? unit : undefined}
                    {second_text && valueDisplayed ? ')' : undefined}
                </div>
                {context && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                        {context}
                    </div>
                )}
            </>
        )
    }

    if (error) {
        return (
            <div className="text-lg text-gray-600 dark:text-gray-300">
                Something went wrong while loading fun facts
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
        )
    }

    return (
        <div className="text-lg text-gray-600 dark:text-gray-300">
            Not enough listening data to generate fun facts — keep streaming!
        </div>
    )
}

export const FunFacts: FC<Props> = ({ fact, error, onRefresh, isLoading }) => {
    const config = fact
        ? fact
        : { fact_type: 'fallback_fact', title: '🎲 Fun Fact', emoji: '🎲' }

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
                data-fact-type={config.fact_type}
            >
                <div className="text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow">
                    {config.emoji}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                        {config.title}
                    </div>

                    <FunFactContent
                        fact={fact}
                        error={error}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    )
}
