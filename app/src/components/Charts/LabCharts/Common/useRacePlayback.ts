import { useEffect, useRef, useState } from 'react'

type Options = {
    frameCount: number
    baseSpeed: number
    entityType?: string
}

type RacePlayback = {
    containerRef: React.RefObject<HTMLDivElement | null>
    currentFrameIdx: number
    isPlaying: boolean
    speedMultiplier: number
    onFrameChange: (idx: number) => void
    onSpeedChange: (speed: number) => void
    onPlayPause: () => void
}

export function useRacePlayback({
    frameCount,
    baseSpeed,
    entityType,
}: Options): RacePlayback {
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speedMultiplier, setSpeedMultiplier] = useState(1)
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting)
            },
            { threshold: 0.1 }
        )

        const el = containerRef.current
        if (el) observer.observe(el)
        return () => {
            if (el) observer.unobserve(el)
        }
    }, [])

    const hasInitialized = useRef(false)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true
            return
        }
        setCurrentFrameIdx(0)
        setIsPlaying(true)
    }, [entityType])

    useEffect(() => {
        if (!isPlaying || !isVisible || frameCount === 0) return

        const interval = setInterval(() => {
            setCurrentFrameIdx((prev) => {
                if (prev >= frameCount - 1) {
                    setIsPlaying(false)
                    return prev
                }
                return prev + 1
            })
        }, baseSpeed / speedMultiplier)

        return () => clearInterval(interval)
    }, [isPlaying, isVisible, frameCount, baseSpeed, speedMultiplier])

    const onFrameChange = (idx: number) => {
        setIsPlaying(false)
        setCurrentFrameIdx(idx)
    }

    const onPlayPause = () => {
        if (currentFrameIdx >= frameCount - 1) {
            setCurrentFrameIdx(0)
            setIsPlaying(true)
        } else {
            setIsPlaying((prev) => !prev)
        }
    }

    return {
        containerRef,
        currentFrameIdx,
        isPlaying,
        speedMultiplier,
        onFrameChange,
        onSpeedChange: setSpeedMultiplier,
        onPlayPause,
    }
}
