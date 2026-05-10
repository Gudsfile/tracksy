const CLOCK_EMOJI = [
    '🕛',
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
]

export function clockEmoji(hour: number): string {
    return CLOCK_EMOJI[hour % 12]
}
