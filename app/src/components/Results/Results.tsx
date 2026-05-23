import { LabView } from '../Charts/LabView'
import { SimpleView } from '../Charts/SimpleView'
import { ChatView } from '../Charts/ChatView'
import { QueryView } from '../Charts/QueryView'
import { useState } from 'react'

type Tab = 'simple' | 'lab' | 'chat' | 'query'

const TABS: { id: Tab; label: string; tooltip: string }[] = [
    {
        id: 'simple',
        label: '✨ Simple',
        tooltip: 'Curated and guided overview of your listening data',
    },
    {
        id: 'lab',
        label: '🔬 Lab',
        tooltip: 'Experimental insights and advanced visualizations',
    },
    {
        id: 'chat',
        label: '💬 Chat (beta)',
        tooltip: 'Conversational exploration using a built-in LLM',
    },
    {
        id: 'query',
        label: '⌨️ Query',
        tooltip: 'Direct SQL-based exploration of the dataset',
    },
]

export function Results() {
    const [activeTab, setActiveTab] = useState<Tab>('simple')
    const tabIndex = TABS.findIndex((t) => t.id === activeTab)

    return (
        <div className="py-8 animate-slide-up">
            <div className="relative mb-8 bg-gray-100 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-300/60 dark:border-slate-700/50 max-w-xl mx-auto">
                <div
                    className="absolute top-1.5 left-1.5 h-[calc(100%-0.75rem)] bg-gradient-brand rounded-xl shadow-glow transition-transform duration-300 ease-out"
                    style={{
                        width: `calc(${(100 / TABS.length).toFixed(4)}% - 0.25rem)`,
                        transform: `translateX(calc(${tabIndex} * (100% + 0.125rem)))`,
                    }}
                />

                <div className="relative flex gap-1" role="tablist">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            title={tab.tooltip}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative z-10 flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                                activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {activeTab === 'simple' ? (
                    <SimpleView />
                ) : activeTab === 'lab' ? (
                    <LabView />
                ) : activeTab === 'query' ? (
                    <QueryView />
                ) : (
                    <ChatView />
                )}
            </div>
        </div>
    )
}
