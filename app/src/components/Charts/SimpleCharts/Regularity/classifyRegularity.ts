export function classifyRegularity(percentage: number): {
    label: string
    color: string
    strokeColor: string
    emoji: string
} {
    if (percentage >= 70)
        return {
            label: 'Constant',
            color: 'text-green-600 dark:text-green-400',
            strokeColor: 'stroke-green-500',
            emoji: '🔥',
        }
    if (percentage >= 30)
        return {
            label: 'Regular',
            color: 'text-yellow-600 dark:text-yellow-400',
            strokeColor: 'stroke-yellow-500',
            emoji: '✨',
        }
    return {
        label: 'Occasional',
        color: 'text-gray-600 dark:text-gray-400',
        strokeColor: 'stroke-gray-500',
        emoji: '🌙',
    }
}
