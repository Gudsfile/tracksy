import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ArtistLoyalty } from './ArtistLoyalty'
import type { ArtistLoyaltyResult } from './query'

describe('ArtistLoyalty Component', () => {
    const createMockData = (
        overrides: Partial<ArtistLoyaltyResult>[]
    ): ArtistLoyaltyResult[] => {
        const defaults: ArtistLoyaltyResult[] = [
            {
                stream_bin: '1',
                artist_count: 50,
                streams_in_bin: 50,
                share_of_total_streams: 0.1,
            },
            {
                stream_bin: '2-10',
                artist_count: 30,
                streams_in_bin: 150,
                share_of_total_streams: 0.15,
            },
            {
                stream_bin: '11-100',
                artist_count: 20,
                streams_in_bin: 500,
                share_of_total_streams: 0.25,
            },
            {
                stream_bin: '101-1000',
                artist_count: 10,
                streams_in_bin: 600,
                share_of_total_streams: 0.3,
            },
            {
                stream_bin: '1000+',
                artist_count: 5,
                streams_in_bin: 700,
                share_of_total_streams: 0.2,
            },
        ]

        return defaults.map((d, i) => ({ ...d, ...overrides[i] }))
    }

    it('renders the title and total artists', () => {
        const data = createMockData([])
        render(<ArtistLoyalty data={data} />)

        screen.getByRole('heading', { name: /🤝Artist Loyalty/ })
        screen.getByText(/115 artists/)
    })

    it('renders all bin labels', () => {
        const data = createMockData([])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('1 stream')
        screen.getByText('2-10 streams')
        screen.getByText('11-100 streams')
        screen.getByText('101-1000 streams')
        screen.getByText('1000+ streams')
    })

    it('displays correct percentages', () => {
        const data = createMockData([])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('10%')
        screen.getByText('15%')
        screen.getByText('25%')
        screen.getByText('30%')
        screen.getByText('20%')
    })

    it('shows Loyal classification when many high-replay artists', () => {
        const data = createMockData([
            { share_of_total_streams: 0.05 },
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.15 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.5 },
        ])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('Ultra Loyal')
        screen.getByText('🔥')
    })

    it('shows Explorer classification when many one-stream artists', () => {
        const data = createMockData([
            { share_of_total_streams: 0.6 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.05 },
            { share_of_total_streams: 0.05 },
        ])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('Explorer')
        screen.getByText('🔍')
    })

    it('shows Favorites classification when high replay > one stream', () => {
        const data = createMockData([
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.15 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.3 },
            { share_of_total_streams: 0.25 },
        ])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('Favorites Driven')
        screen.getByText('❤️')
    })

    it('shows Balanced classification for mixed data', () => {
        const data = createMockData([
            { share_of_total_streams: 0.1 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.45 },
            { share_of_total_streams: 0.15 },
            { share_of_total_streams: 0.1 },
        ])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('Balanced Regular')
        screen.getByText('⚖️')
    })

    it('shows Curious classification by default', () => {
        const data = createMockData([
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.2 },
            { share_of_total_streams: 0.2 },
        ])
        render(<ArtistLoyalty data={data} />)

        screen.getByText('Curious')
        screen.getByText('🧐')
    })
})
