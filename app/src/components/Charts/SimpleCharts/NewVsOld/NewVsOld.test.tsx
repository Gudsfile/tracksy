import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewVsOld } from './NewVsOld'

describe('NewVsOld Component', () => {
    it('renders empty state when data is undefined', () => {
        render(<NewVsOld data={undefined} isLoading={false} year={2025} />)
        screen.getByText('No data for this year')
    })

    it('renders empty state when all values are zero', () => {
        render(
            <NewVsOld
                data={{
                    new_artists_streams: 0,
                    old_artists_streams: 0,
                    new_artists_count: 0,
                    total: 0,
                }}
                isLoading={false}
                year={2025}
            />
        )
        screen.getByText('No data for this year')
    })

    it('renders correctly with a specific year', async () => {
        const data = {
            new_artists_streams: 30,
            old_artists_streams: 70,
            new_artists_count: 5,
            total: 100,
        }

        render(<NewVsOld data={data} year={2025} />)

        screen.getByRole('heading', { name: /🆕Fresh vs Familiar/ })
        screen.getByText('30%')
        screen.getByText('70%')
        screen.getByText(/5 new artists discovered this year/)
    })

    it('renders Trend Hunter when new artists dominate', () => {
        render(
            <NewVsOld
                data={{
                    new_artists_streams: 70,
                    old_artists_streams: 30,
                    new_artists_count: 10,
                    total: 100,
                }}
                year={2025}
            />
        )
        screen.getByText('Trend Hunter')
    })

    it('renders Balanced Taste when new and old are equal', () => {
        render(
            <NewVsOld
                data={{
                    new_artists_streams: 50,
                    old_artists_streams: 50,
                    new_artists_count: 2,
                    total: 100,
                }}
                year={2025}
            />
        )
        screen.getByText('Balanced Taste')
    })

    it('renders all-time fallback when year is undefined', () => {
        render(<NewVsOld data={undefined} year={undefined} totalArtists={42} />)
        screen.getByText('Select a year to see your Fresh vs Familiar split')
        screen.getByText(/42 artists discovered all time/)
    })

    it('renders all-time fallback without insight when totalArtists is undefined', () => {
        render(<NewVsOld data={undefined} year={undefined} />)
        screen.getByText('Select a year to see your Fresh vs Familiar split')
        expect(screen.queryByText(/artists discovered all time/)).toBeNull()
    })
})
