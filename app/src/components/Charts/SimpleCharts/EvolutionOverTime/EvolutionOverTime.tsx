import type { FC } from 'react'
import type { EvolutionResult } from './query'

type Props = {
    data: EvolutionResult[]
}

export const EvolutionOverTime: FC<Props> = ({ data }) => {
    if (data.length === 0) return null

    const maxStreams = Math.max(...data.map((d) => d.streams))
    const currentYear = new Date().getFullYear()
    const currentYearData = data.find((d) => d.year === currentYear)
    const totalStreams = data.reduce((acc, curr) => acc + curr.streams, 0)
    const startYear = Math.min(...data.map((d) => d.year))

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col justify-between text-gray-900 dark:text-gray-100">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    📈 Evolution
                </h3>
                <div className="flex items-end gap-1 h-24 mt-4 mb-2">
                    {data.map((d) => {
                        const height = (d.streams / maxStreams) * 100
                        return (
                            <div
                                key={d.year}
                                className="flex-1 bg-blue-100 dark:bg-blue-900 rounded-t relative group"
                                style={{ height: `${height}%` }}
                            >
                                <div
                                    className={`absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t transition-all duration-300 ${
                                        d.year === currentYear
                                            ? 'bg-purple-500'
                                            : ''
                                    }`}
                                    style={{ height: '100%' }}
                                ></div>
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    {d.year}: {d.streams}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                    <span>{startYear}</span>
                    <span>{Math.max(...data.map((d) => d.year))}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total streams
                    </span>
                    <span className="font-bold">
                        {totalStreams.toLocaleString()}
                    </span>
                </div>
                {currentYearData && (
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            This year
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                            {currentYearData.streams.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
