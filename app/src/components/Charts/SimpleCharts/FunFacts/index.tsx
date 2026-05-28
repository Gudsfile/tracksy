import { useEffect, useRef, useState, useCallback } from 'react'
import { type FunFactData, facts } from './queries'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import { FunFacts as FunFactsView, type FunFactProps } from './FunFacts'

const shuffle = <T,>(array: readonly T[]): T[] => {
    const copy = [...array]
    return copy.sort(() => Math.random() - 0.5)
}

export function FunFacts() {
    const [fact, setFact] = useState<FunFactProps | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | undefined>(undefined)
    const seenFactsRef = useRef<Set<string>>(new Set())

    const loadRandomFact = useCallback(async () => {
        setIsLoading(true)
        setError(undefined)
        try {
            if (seenFactsRef.current.size === facts.length) {
                seenFactsRef.current.clear()
            }

            const unseenFacts = facts.filter(
                (fact) => !seenFactsRef.current.has(fact.fact_type)
            )

            const candidates = unseenFacts.length > 0 ? unseenFacts : facts

            const [factDefinition] = shuffle(candidates)

            seenFactsRef.current.add(factDefinition.fact_type)

            const [result] = await queryDBAsJSON<FunFactData>(
                factDefinition.sql
            )
            setFact({
                title: factDefinition.title,
                emoji: factDefinition.emoji,
                fact_type: factDefinition.fact_type,
                main_text: result?.entity ?? undefined,
                second_text: result?.parent_entity,
                value: result?.metric,
                unit: result?.unit,
                context: [factDefinition.context, result?.context_suffix]
                    .filter(Boolean)
                    .join(' '),
            })
        } catch (error) {
            console.error('Error loading fun fact:', error)
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load fun fact'
            )
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

    return (
        <FunFactsView
            fact={fact}
            onRefresh={loadRandomFact}
            isLoading={isLoading}
            error={error}
        />
    )
}
