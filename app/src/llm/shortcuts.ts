import type { Suggestion } from './types'

/** A built-in shortcut chip: a suggestion plus the emoji shown on the pill. */
export type Shortcut = Suggestion & { emoji: string }

/**
 * The fixed starter chips.
 *
 * Shown whenever there is nothing generated to display — an empty input, or a
 * failed/empty suggestion run — so the chip row is never blank. Also passed to
 * `askSuggestions` as style examples, which is why they live here rather than
 * inside the component.
 */
export const SHORTCUTS: Shortcut[] = [
    {
        emoji: '🎵',
        label: 'Top artists',
        question: 'Who are my top 5 most listened to artists?',
    },
    {
        emoji: '🌙',
        label: 'Late night',
        question: 'What do I listen to after midnight?',
    },
    {
        emoji: '☀️',
        label: 'Season trends',
        question: 'How does my listening change by season?',
    },
    {
        emoji: '🔁',
        label: 'Most replayed',
        question: 'What is my most replayed track?',
    },
    {
        emoji: '📅',
        label: 'Peak day',
        question: 'Which day of the week do I listen most?',
    },
    {
        emoji: '🆕',
        label: 'Discovery',
        question: 'Which artists did I discover this year?',
    },
]

/** Emoji used for every model-generated chip, so they read as machine-made. */
export const SUGGESTION_EMOJI = '✨'
