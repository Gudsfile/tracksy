import type { ArtistLoyaltyResult } from './query'

export const classifyArtistLoyalty = (data: ArtistLoyaltyResult[]) => {
    const getShare = (bin: string) =>
        data.find((b) => b.stream_bin === bin)?.share_of_total_streams || 0

    const share1 = getShare('1')
    const share2to10 = getShare('2-10')
    const share11to100 = getShare('11-100')
    const share101to1000 = getShare('101-1000')
    const share1000plus = getShare('1000+')

    const lowEngagement = share1 + share2to10
    const midEngagement = share11to100
    const highEngagement = share101to1000 + share1000plus

    if (highEngagement > 0.6) {
        return { label: 'Ultra Loyal', emoji: '🔥' }
    }

    if (lowEngagement > 0.6) {
        return { label: 'Explorer', emoji: '🔍' }
    }

    if (highEngagement > lowEngagement) {
        return { label: 'Favorites Driven', emoji: '❤️' }
    }

    if (midEngagement > 0.4) {
        return { label: 'Balanced Regular', emoji: '⚖️' }
    }

    return { label: 'Curious', emoji: '🧐' }
}
