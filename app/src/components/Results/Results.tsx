import { ExpertView } from '../Charts/ExpertView'
import { SimpleView } from '../Charts/SimpleView'
import { useState } from 'react'

export function Results() {
    const [activeTab, setActiveTab] = useState<'simple' | 'expert'>('expert')

    return (
        <div className="py-8">
            <div className="flex gap-2 mb-5 bg-gray-200 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('simple')}
                    className={`flex-1 px-5 py-2.5 text-base cursor-pointer border-none rounded-lg transition-colors duration-200 ${
                        activeTab === 'simple'
                            ? 'bg-white text-black'
                            : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Simple View
                </button>
                <button
                    onClick={() => setActiveTab('expert')}
                    className={`flex-1 px-5 py-2.5 text-base cursor-pointer border-none rounded-lg transition-colors duration-200 ${
                        activeTab === 'expert'
                            ? 'bg-white text-black'
                            : 'bg-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Expert View
                </button>
            </div>

            <div className="min-h-screen">
                {activeTab === 'simple' ? <SimpleView /> : <ExpertView />}
            </div>
        </div>
    )
}
