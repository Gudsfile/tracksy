import { useEffect, useRef, useState, useCallback } from 'react'
import { queryDefinitions, type FunFactResult } from './queries'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFacts as FunFactsView } from './FunFacts'

export function FunFacts() {
    const [fact, setFact] = useState<FunFactResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const seenFactsRef = useRef<Set<string>>(new Set())

    const loadRandomFact = useCallback(async () => {
        setIsLoading(true)
        try {
            if (seenFactsRef.current.size === queryDefinitions.length) {
                seenFactsRef.current.clear()
            }

            const unseenQueries = queryDefinitions.filter(
                (q) => !seenFactsRef.current.has(q.name)
            )
            const availableQueries =
                unseenQueries.length > 0 ? unseenQueries : queryDefinitions

            const shuffled = [...availableQueries].sort(
                () => Math.random() - 0.5
            )

            for (const queryDef of shuffled) {
                const [result] =
                    (await queryDBAsJSON<FunFactResult>(queryDef.sql)) || []

                seenFactsRef.current.add(queryDef.name)
                if (result) {
                    setFact(result)
                    break
                }
                console.warn(
                    'An empty result is returned by a fun fact:',
                    queryDef.name
                )
            }
        } catch (error) {
            console.error('Error loading fun fact:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadRandomFact()
    }, [])

    useEffect(() => {
        const handleDataLoaded = () => {
            seenFactsRef.current.clear()
            loadRandomFact()
        }
        window.addEventListener(DATA_LOADED_EVENT, handleDataLoaded)
        return () =>
            window.removeEventListener(DATA_LOADED_EVENT, handleDataLoaded)
    }, [loadRandomFact])

    if (!fact) return null

    return (
        <FunFactsView
            fact={fact}
            onRefresh={loadRandomFact}
            isLoading={isLoading}
        />
    )
}
