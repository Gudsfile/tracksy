import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopArtists } from './TopArtists'

describe('TopArtists Component', () => {
    it('renders correctly with data', async () => {
        const numberOfTracks = 10
        const data = Array.from({ length: numberOfTracks }, (_, i) => ({
            artist_name: `artist_${i + 1}`,
            count_streams: i + 1,
            ms_played: i * 1000 + 1000,
        }))

        render(<TopArtists data={data} />)

        screen.getByRole('heading', { name: /🎤Top Artists/ })

        const items = screen.getAllByRole('listitem')
        expect(items).toHaveLength(numberOfTracks)
        expect(items[0].textContent).toBe('🥇artist_11s1')
        expect(items[1].textContent).toBe('🥈artist_22s2')
        expect(items[2].textContent).toBe('🥉artist_33s3')
        expect(items[3].textContent).toBe('4️⃣artist_44s4')
        expect(items[4].textContent).toBe('5️⃣artist_55s5')
        // Items beyond the top 5 should not display any ranking emoji
        expect(items[5].textContent).toBe('artist_66s6')
    })
})
