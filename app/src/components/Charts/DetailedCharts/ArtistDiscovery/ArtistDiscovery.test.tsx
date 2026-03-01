import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import * as queries from './query'
import * as query from '../../../../db/queries/queryDB'
import * as db from '../../../../db/getDB'

import { ArtistDiscovery } from '.'

const artistDiscoveryData: queries.ArtistDiscoveryQueryResult[] = [
    {
        year: 2020,
        new_artists: 2,
        cumulative_artists: 2,
        avg_listens_per_artist: 1.5,
    },
    {
        year: 2021,
        new_artists: 1,
        cumulative_artists: 3,
        avg_listens_per_artist: 1,
    },
    {
        year: 2022,
        new_artists: 0,
        cumulative_artists: 3,
        avg_listens_per_artist: 0,
    },
    {
        year: 2023,
        new_artists: 0,
        cumulative_artists: 3,
        avg_listens_per_artist: 2,
    },
]

describe('ArtistDiscovery Component', () => {
    beforeEach(() => {
        vi.spyOn(query, 'queryDBAsJSON').mockResolvedValue(artistDiscoveryData)

        vi.spyOn(db, 'getDB').mockResolvedValue({
            db: vi.fn(),
            conn: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof db.getDB>>)
    })

    it('should render the cumulative mode by default', async () => {
        const { container } = render(<ArtistDiscovery />)

        await screen.findByText('Artists Discovered Over Time')
        await screen.findByRole('button', {
            name: /cumulative number of unique artists/i,
        })

        expect(query.queryDBAsJSON).toHaveBeenCalledTimes(1)

        const svg = container.querySelector('svg')
        expect(svg).toBeTruthy()
    })

    it('should switch the mode on click', async () => {
        render(<ArtistDiscovery />)

        const button = await screen.findByRole('button', {
            name: /cumulative number of unique artists/i,
        })

        fireEvent.click(button)

        await screen.findByRole('button', {
            name: /newly discovered artists/i,
        })

        fireEvent.click(button)

        await screen.findByRole('button', {
            name: /cumulative number of unique artists/i,
        })
    })
})
