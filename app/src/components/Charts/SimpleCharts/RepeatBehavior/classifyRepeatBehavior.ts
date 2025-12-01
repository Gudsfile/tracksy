export function classifyRepeatBehavior(total_repeat_sequences: number): {
    classification: string
    emoji: string
} {
    if (total_repeat_sequences > 50) {
        return { classification: 'Obsessive', emoji: '🔥' }
    }

    if (total_repeat_sequences < 10) {
        return { classification: 'Variated', emoji: '🔀' }
    }

    return { classification: 'Moderate', emoji: '🔁' }
}
