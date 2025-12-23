import { DetailedView } from '../Charts/DetailedView'
import { SimpleView } from '../Charts/SimpleView'
import { useState } from 'react'

export function Results() {
    const [activeTab, setActiveTab] = useState<'simple' | 'detailed'>('simple')

    return (
        <div className="py-8 animate-slide-up">
            <div className="relative mb-8 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-md mx-auto">
                <div
                    className={`absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.375rem)] bg-gradient-brand rounded-xl shadow-glow transition-transform duration-300 ease-out ${
                        activeTab === 'detailed'
                            ? 'translate-x-full'
                            : 'translate-x-0'
                    }`}
                />

                <div className="relative flex gap-1" role="tablist">
                    <button
                        role="tab"
                        aria-selected={activeTab === 'simple'}
                        onClick={() => setActiveTab('simple')}
                        className={`relative z-10 flex-1 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                            activeTab === 'simple'
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        ✨ Simple View
                    </button>
                    <button
                        role="tab"
                        aria-selected={activeTab === 'detailed'}
                        onClick={() => setActiveTab('detailed')}
                        className={`relative z-10 flex-1 px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                            activeTab === 'detailed'
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        🔬 Detailed View
                    </button>
                </div>
            </div>

            <div className="min-h-screen">
                {activeTab === 'detailed' ? <DetailedView /> : <SimpleView />}
            </div>
        </div>
    )
}
