import {
    lazy,
    Suspense,
    useCallback,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import { SimpleView } from '../Charts/SimpleView'
import { Spinner } from '../Spinner/Spinner'
import { QueryTabContext } from './QueryTabContext'
import { TabPanelActiveContext } from './TabPanelContext'

const LabView = lazy(() =>
    import('../Charts/LabView').then((m) => ({ default: m.LabView }))
)
const ChatView = lazy(() =>
    import('../Charts/ChatView').then((m) => ({ default: m.ChatView }))
)
const QueryView = lazy(() =>
    import('../Charts/QueryView').then((m) => ({ default: m.QueryView }))
)

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

function TabFallback() {
    return (
        <div className="flex justify-center py-12">
            <Spinner />
        </div>
    )
}

// Keep each panel mounted once visited and toggle visibility instead of
// unmounting, so switching tabs does not remount the view (which caused a
// visible jump/refresh flicker and re-ran the view's queries). See #560.
function TabPanel({
    id,
    active,
    children,
}: {
    id: Tab
    active: boolean
    children: ReactNode
}) {
    return (
        <div
            role="tabpanel"
            id={`panel-${id}`}
            aria-labelledby={`tab-${id}`}
            tabIndex={active ? 0 : -1}
            hidden={!active}
        >
            <TabPanelActiveContext.Provider value={active}>
                {children}
            </TabPanelActiveContext.Provider>
        </div>
    )
}

export function Results() {
    const [activeTab, setActiveTab] = useState<Tab>('simple')
    const [visitedTabs, setVisitedTabs] = useState<Set<Tab>>(
        () => new Set<Tab>(['simple'])
    )
    const [queryKey, setQueryKey] = useState(0)
    const pendingQueryRef = useRef<string | undefined>(undefined)
    const tabIndex = TABS.findIndex((t) => t.id === activeTab)

    const selectTab = useCallback((tab: Tab) => {
        setActiveTab(tab)
        setVisitedTabs((prev) =>
            prev.has(tab) ? prev : new Set(prev).add(tab)
        )
    }, [])

    const openInQueryTab = useCallback(
        (sql: string) => {
            pendingQueryRef.current = sql
            selectTab('query')
            setQueryKey((k) => k + 1)
        },
        [selectTab]
    )

    const clearPendingQuery = () => {
        pendingQueryRef.current = undefined
    }

    return (
        <QueryTabContext.Provider value={openInQueryTab}>
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
                                id={`tab-${tab.id}`}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`panel-${tab.id}`}
                                title={tab.tooltip}
                                onClick={() => selectTab(tab.id)}
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
                    <TabPanel id="simple" active={activeTab === 'simple'}>
                        <SimpleView />
                    </TabPanel>
                    {visitedTabs.has('lab') && (
                        <TabPanel id="lab" active={activeTab === 'lab'}>
                            <Suspense fallback={<TabFallback />}>
                                <LabView />
                            </Suspense>
                        </TabPanel>
                    )}
                    {visitedTabs.has('chat') && (
                        <TabPanel id="chat" active={activeTab === 'chat'}>
                            <Suspense fallback={<TabFallback />}>
                                <ChatView />
                            </Suspense>
                        </TabPanel>
                    )}
                    {visitedTabs.has('query') && (
                        <TabPanel id="query" active={activeTab === 'query'}>
                            <Suspense fallback={<TabFallback />}>
                                <QueryView
                                    key={queryKey}
                                    initialQuery={pendingQueryRef.current}
                                    onQueryConsumed={clearPendingQuery}
                                />
                            </Suspense>
                        </TabPanel>
                    )}
                </div>
            </div>
        </QueryTabContext.Provider>
    )
}
