import { useEffect, useState, useCallback } from 'react'
import {
    queryAfternoonFavorite,
    queryEveningFavorite,
    queryNightFavorite,
    queryMorningFavorite,
    queryMarathon,
    queryOneHitWonder,
    queryWeekendFavorite,
    queryAbsoluteLoyalty,
    queryNostalgicReturn,
    queryVarietyDay,
    queryBingeListener,
    queryCurrentObsession,
    queryRecentDiscovery,
    queryPeakHour,
    querySubscribedArtist,
    queryMusicalAnniversary,
    queryFirstArtist,
    queryUnbeatableStreak,
    queryForgottenArtist,
    queryTrackProposition,
    type FunFactResult,
} from './queries'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { FunFacts as FunFactsView } from './FunFacts'

const QUERY_FUNCTIONS = [
    queryAfternoonFavorite,
    queryEveningFavorite,
    queryNightFavorite,
    queryMorningFavorite,
    queryMarathon,
    queryOneHitWonder,
    queryWeekendFavorite,
    queryAbsoluteLoyalty,
    queryNostalgicReturn,
    queryVarietyDay,
    queryBingeListener,
    queryCurrentObsession,
    queryFirstArtist,
    queryRecentDiscovery,
    queryPeakHour,
    querySubscribedArtist,
    queryMusicalAnniversary,
    queryUnbeatableStreak,
    queryForgottenArtist,
    queryTrackProposition,
]

export function FunFacts() {
    const [fact, setFact] = useState<FunFactResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const loadRandomFact = useCallback(async () => {
        setIsLoading(true)
        try {
            for (let i = 0; i < 3; i++) {
                const randomQuery =
                    QUERY_FUNCTIONS[
                        Math.floor(Math.random() * QUERY_FUNCTIONS.length)
                    ]
                const result = await queryDBAsJSON<FunFactResult>(randomQuery())

                if (result && result.length > 0) {
                    if (
                        fact &&
                        result[0].factType === fact.factType &&
                        QUERY_FUNCTIONS.length > 1
                    ) {
                        continue
                    }
                    setFact(result[0])
                    break
                }
            }
        } catch (error) {
            console.error('Error loading fun fact:', error)
        } finally {
            setIsLoading(false)
        }
    }, [fact])

    useEffect(() => {
        loadRandomFact()
    }, [])

    if (!fact) return null

    return (
        <FunFactsView
            fact={fact}
            onRefresh={loadRandomFact}
            isLoading={isLoading}
        />
    )
}
