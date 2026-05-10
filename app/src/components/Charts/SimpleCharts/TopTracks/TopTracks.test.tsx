import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopTracks } from './TopTracks'

describe('TopTracks Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<TopTracks data={undefined} isLoading={false} />)
        screen.getByText('No data for this year')
    })

    it('renders correctly with data', async () => {
        const numberOfTracks = 10
        const data = Array.from({ length: numberOfTracks }, (_, i) => ({
            track_name: `track_${i + 1}`,
            artist_name: `artist_${(i % 3) + 1}`,
            count_streams: i + 1,
            ms_played: i + 1,
        }))

        render(<TopTracks data={data} />)

        screen.getByRole('heading', { name: /🎵Top Tracks/ })

        const items = screen.getAllByRole('listitem')
        expect(items).toHaveLength(numberOfTracks)
        expect(items[0].textContent).toBe('🥇track_1artist_11')
        expect(items[1].textContent).toBe('🥈track_2artist_22')
        expect(items[2].textContent).toBe('🥉track_3artist_33')
        expect(items[3].textContent).toBe('4️⃣track_4artist_14')
        expect(items[4].textContent).toBe('5️⃣track_5artist_25')
        // Items beyond the top 5 should not display any ranking emoji
        expect(items[5].textContent).toBe('track_6artist_36')
    })
})
