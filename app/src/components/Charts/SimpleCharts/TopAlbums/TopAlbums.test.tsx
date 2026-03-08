import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopAlbums } from './TopAlbums'

describe('TopAlbums Component', () => {
    it('renders correctly with data', async () => {
        const numberOfTracks = 10
        const data = Array.from({ length: numberOfTracks }, (_, i) => ({
            album_name: `album_${i + 1}`,
            artist_name: `artist_${(i % 3) + 1}`,
            count_streams: i + 1,
            ms_played: i + 1,
        }))

        render(<TopAlbums data={data} />)

        screen.getByRole('heading', { name: /💿Top Albums/ })

        const items = screen.getAllByRole('listitem')
        expect(items).toHaveLength(numberOfTracks)
        expect(items[0].textContent).toBe('🥇album_1artist_11')
        expect(items[1].textContent).toBe('🥈album_2artist_22')
        expect(items[2].textContent).toBe('🥉album_3artist_33')
        expect(items[3].textContent).toBe('4️⃣album_4artist_14')
        expect(items[4].textContent).toBe('5️⃣album_5artist_25')
        // Items beyond the top 5 should not display any ranking emoji
        expect(items[5].textContent).toBe('album_6artist_36')
    })
})
