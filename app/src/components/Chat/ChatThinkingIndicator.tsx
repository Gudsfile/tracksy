import { useState, useEffect } from 'react'

const PHRASES = [
    'Crate digging through your library…',
    'Sampling your streams…',
    'Tuning into your vibes…',
    'Dropping the beat analysis…',
    'Rewinding your data…',
    'Spinning up the algorithm…',
    'Harmonizing the query…',
    'Processing the frequency…',
    'Reading the waveform…',
    'Sequencing the query…',
    'Finding the groove in the data…',
    'Encoding your listening history…',
]

export function ChatThinkingIndicator() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        setIndex(0)
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % PHRASES.length)
        }, 2800)
        return () => clearInterval(id)
    }, [])

    return (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500 h-6">
            <span>♪</span>
            <span key={index} className="animate-vibe-pulse">
                {PHRASES[index]}
            </span>
        </div>
    )
}
