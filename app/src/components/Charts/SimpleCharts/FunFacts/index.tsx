import { useEffect, useRef, useState, useCallback } from 'react'
import { type FunFactResult, facts } from './queries'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFacts as FunFactsView, type FunFactProps } from './FunFacts'

const shuffle = <T,>(array: readonly T[]): T[] => {
    const copy = [...array]
    return copy.sort(() => Math.random() - 0.5)
}

export function FunFacts() {
    const [fact, setFact] = useState<FunFactProps | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const seenFactsRef = useRef<Set<string>>(new Set())

    const loadRandomFact = useCallback(async () => {
        setIsLoading(true)
        try {
            if (seenFactsRef.current.size === facts.length) {
                seenFactsRef.current.clear()
            }

            const unseenFacts = facts.filter(
                (fact) => !seenFactsRef.current.has(fact.fact_type)
            )

            const candidates = unseenFacts.length > 0 ? unseenFacts : facts

            const shuffled = shuffle(candidates)

            for (const factDefinition of shuffled) {
                const [result] = await queryDBAsJSON<FunFactResult>(
                    factDefinition.sql
                )

                seenFactsRef.current.add(factDefinition.fact_type)
                if (result) {
                    setFact({
                        title: factDefinition.title,
                        emoji: factDefinition.emoji,
                        ...result,
                    })
                    break
                }
                console.warn(
                    'An empty result is returned by a fun fact:',
                    factDefinition.fact_type
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
    }, [loadRandomFact])

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
