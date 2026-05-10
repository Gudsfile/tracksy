import { useEffect, useRef, useState, useCallback } from 'react'
import { QUERY_FUNCTIONS, type FunFactResult } from './queries'
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
            if (seenFactsRef.current.size === QUERY_FUNCTIONS.length) {
                seenFactsRef.current.clear()
            }

            const unseenQueries = QUERY_FUNCTIONS.filter(
                (q) => !seenFactsRef.current.has(q.name)
            )
            const availableQueries =
                unseenQueries.length > 0 ? unseenQueries : QUERY_FUNCTIONS

            const shuffled = [...availableQueries].sort(
                () => Math.random() - 0.5
            )

            for (const queryFn of shuffled) {
                const [result] =
                    (await queryDBAsJSON<FunFactResult>(queryFn())) || []

                seenFactsRef.current.add(queryFn.name)
                if (result) {
                    setFact(result)
                    break
                }
                console.warn(
                    'An empty result is returned by a fun fact:',
                    queryFn.name
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
