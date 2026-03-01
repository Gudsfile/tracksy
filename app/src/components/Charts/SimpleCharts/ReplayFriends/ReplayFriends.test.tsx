import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReplayFriends } from './ReplayFriends'
import type { ArtistReplayBin } from './query'

describe('ReplayFriends Component', () => {
    const createMockData = (overrides: Partial<ArtistReplayBin>[]): ArtistReplayBin[] => {
        const defaults: ArtistReplayBin[] = [
            { stream_bin: '1', artist_count: 50, streams_in_bin: 50, share_of_total_streams: 0.1 },
            { stream_bin: '2-10', artist_count: 30, streams_in_bin: 150, share_of_total_streams: 0.15 },
            { stream_bin: '11-100', artist_count: 20, streams_in_bin: 500, share_of_total_streams: 0.25 },
            { stream_bin: '101-1000', artist_count: 10, streams_in_bin: 600, share_of_total_streams: 0.3 },
            { stream_bin: '1000+', artist_count: 5, streams_in_bin: 700, share_of_total_streams: 0.2 },
        ]

        return defaults.map((d, i) => ({ ...d, ...overrides[i] }))
    }

    it('renders the title and total artists', () => {
        const data = createMockData([])
        render(<ReplayFriends data={data} />)

        screen.getByText('🤝 Replay Friends')
        screen.getByText(/115 artists/)
    })

    it('renders all bin labels', () => {
        const data = createMockData([])
        render(<ReplayFriends data={data} />)

        screen.getByText('1 stream')
        screen.getByText('2-10 streams')
        screen.getByText('11-100 streams')
        screen.getByText('101-1000 streams')
        screen.getByText('1000+ streams')
    })

    it('displays correct percentages', () => {
        const data = createMockData([])
        render(<ReplayFriends data={data} />)

        screen.getByText('10%')
        screen.getByText('15%')
        screen.getByText('25%')
        screen.getByText('30%')
        screen.getByText('20%')
    })

    it('shows Explorer classification when many one-stream artists', () => {
        const data = createMockData([
            { share_of_total_streams: 0.6 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.05 },
            { share_of_total_streams: 0.05 },
        ])
        render(<ReplayFriends data={data} />)

        screen.getByText('Explorer')
        screen.getByText('🔍')
    })

    it('shows Loyal classification when many high-replay artists', () => {
        const data = createMockData([
            { share_of_total_streams: 0.05 },
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.15 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.5 },
        ])
        render(<ReplayFriends data={data} />)

        screen.getByText('Loyal')
        screen.getByText('🔂')
    })

    it('shows Balanced classification for mixed data', () => {
        const data = createMockData([])
        render(<ReplayFriends data={data} />)

        screen.getByText('Balanced')
        screen.getByText('⚖️')
    })

    it('shows Favorites classification when high replay > one stream', () => {
        const data = createMockData([
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.15 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.3 },
            { share_of_total_streams: 0.25 },
        ])
        render(<ReplayFriends data={data} />)

        screen.getByText('Favorites')
        screen.getByText('❤️')
    })
})
