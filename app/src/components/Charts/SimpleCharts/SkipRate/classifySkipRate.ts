export function classifySkipRate(percentage: number): {
    classification: string
    emoji: string
    message: string
} {
    if (percentage < 50) {
        return {
            classification: 'Impatient',
            emoji: '⏭️',
            message: 'You skip often!',
        }
    } else if (percentage > 75) {
        return {
            classification: 'Patient',
            emoji: '🧘',
            message: 'You savor every note!',
        }
    }

    return {
        classification: 'Normal',
        emoji: '😐',
        message: 'You have an equilibrated listening.',
    }
}
