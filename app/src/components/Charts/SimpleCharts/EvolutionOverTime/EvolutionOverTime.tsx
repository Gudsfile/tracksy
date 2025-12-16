import type { FC } from 'react'
import type { EvolutionResult } from './query'
import { formatDuration } from '../../../../utils/formatDuration'

type Props = {
    data: EvolutionResult[]
    year: number
}

export const EvolutionOverTime: FC<Props> = ({ data, year }) => {
    if (data.length === 0) return null

    const maxStreams = Math.max(...data.map((d) => d.streams))
    const currentYearData = data.find((d) => d.year === year)
    const totalStreams = data.reduce((acc, curr) => acc + curr.streams, 0)
    const startYear = Math.min(...data.map((d) => d.year))

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in flex flex-col justify-between h-full">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📈 Evolution
            </h3>
            <div className="flex items-end gap-1 h-24 mt-4 mb-2">
                {data.map((d) => {
                    const height = (d.streams / maxStreams) * 100
                    return (
                        <div
                            key={d.year}
                            className="flex-1 bg-brand-blue dark:bg-brand-blue rounded-t relative group"
                            style={{ height: `${height}%` }}
                        >
                            <div
                                className={`absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t transition-all duration-300 ${
                                    d.year === year ? 'bg-brand-purple' : ''
                                }`}
                                style={{ height: '100%' }}
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                {d.year}
                                <br /> {d.streams.toLocaleString()} streams
                                <br /> ({formatDuration(d.ms_played)})
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                <span>{startYear}</span>
                <span>{Math.max(...data.map((d) => d.year))}</span>
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
                        <span className="font-bold text-brand-purple dark:text-brand-purple">
                            {currentYearData.streams.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
